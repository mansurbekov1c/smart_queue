-- =====================================================
-- Smart Queue — Xavfsizlikni kuchaytirish (audit natijalari)
-- Tuzatiladi:
--   #1 profiles: mijoz o'z role/coins/branch_id'sini o'zgartira olmasin
--   #2 tickets: mijoz o'z chiptasini to'g'ridan-to'g'ri o'zgartira olmasin
--      (+ to'g'ridan-to'g'ri INSERT ham yopiladi — faqat join_queue orqali)
--   #3 join_queue: bitta foydalanuvchida bitta faol chipta
--   #4 branches: admin rating/review_count/is_featured'ni o'zgartira olmasin
--   #7 join_queue: ish soatlari (open/close) tekshiruvi + timezone tuzatish
-- Idempotent. Mock ma'lumot yo'q.
-- =====================================================

-- =====================================================
-- #1 PROFILES — ustun darajasidagi cheklov
-- Endi mijoz faqat first_name, last_name, phone ni yangilay oladi.
-- role, coins, branch_id, email faqat SECURITY DEFINER funksiyalar
-- (pastdagi RPClar, handle_new_user, award_service_coins, delay_ticket)
-- orqali o'zgaradi — ular jadval egasi huquqi bilan ishlaydi.
-- =====================================================
revoke insert, update, delete on profiles from anon, authenticated;
grant update (first_name, last_name, phone) on profiles to authenticated;

-- Super admin operatsiyalari endi RPC orqali (client to'g'ridan-to'g'ri
-- role/branch_id ustunlarini yangilay olmaydi):

-- customer -> admin ko'tarish (hech qachon super_admin ga emas)
create or replace function promote_to_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_super_admin() then
    raise exception 'not authorized';
  end if;

  update profiles set role = 'admin'
  where id = p_user_id and role = 'customer';

  if not found then
    raise exception 'user not found or not a customer';
  end if;
end;
$$;

-- Adminni filialga biriktirish (o'sha filialdagi eski adminni bo'shatib) —
-- avvalgi ikki bosqichli client kodidan farqli, bitta tranzaksiyada.
create or replace function assign_admin_branch(p_admin_id uuid, p_branch_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_super_admin() then
    raise exception 'not authorized';
  end if;

  if not exists (select 1 from profiles where id = p_admin_id and role = 'admin') then
    raise exception 'target user is not an admin';
  end if;

  update profiles set branch_id = null
  where branch_id = p_branch_id and id <> p_admin_id;

  update profiles set branch_id = p_branch_id where id = p_admin_id;
end;
$$;

create or replace function unassign_admin_branch(p_admin_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_super_admin() then
    raise exception 'not authorized';
  end if;

  update profiles set branch_id = null
  where id = p_admin_id and role = 'admin';
end;
$$;

grant execute on function promote_to_admin(uuid)            to authenticated;
grant execute on function assign_admin_branch(uuid, uuid)   to authenticated;
grant execute on function unassign_admin_branch(uuid)       to authenticated;

-- =====================================================
-- #2 TICKETS — mijozning to'g'ridan-to'g'ri yozuvi yopiladi
-- Mijoz uchun barcha amallar RPC orqali (join_queue / leave_queue /
-- delay_ticket). To'g'ridan-to'g'ri UPDATE faqat admin/super_admin uchun
-- (resetBranchQueue ishlatadi). To'g'ridan-to'g'ri INSERT hech kimga kerak
-- emas (walk-in ham join_queue orqali) — policy butunlay olib tashlanadi.
-- =====================================================
drop policy if exists tickets_update_own_admin on tickets;
create policy tickets_update_admin_only on tickets
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and (
          profiles.role = 'super_admin'
          or (profiles.role = 'admin' and profiles.branch_id = tickets.branch_id)
        )
    )
  );

drop policy if exists tickets_insert_self_or_admin on tickets;
-- insert policy yo'q = to'g'ridan-to'g'ri insert taqiqlangan;
-- join_queue (security definer) RLS'dan mustaqil ishlayveradi.

-- =====================================================
-- #4 BRANCHES — ustun darajasidagi cheklov
-- rating, review_count, is_featured, service_sample_count,
-- schedule_calibrated_at endi faqat trigger/definer funksiyalar orqali.
-- =====================================================
revoke update on branches from anon, authenticated;
grant update (name, category, city, district, address, hours,
              lat, lng, is_open, weekly_schedule, avg_service_minutes)
  on branches to authenticated;

-- =====================================================
-- #3 + #7 JOIN_QUEUE — yakuniy versiya (09 dagi barcha tekshiruvlar
-- saqlangan holda ikkita yangi tekshiruv va timezone tuzatish):
--   (c) bitta foydalanuvchida bitta faol chipta (istalgan filialda)
--   (d) ish soatlari: open <= hozirgi vaqt < close
--   (tz) barcha sana/vaqt hisoblari Asia/Tashkent bo'yicha —
--        avval current_date UTC edi: mahalliy 00:00-05:00 oralig'ida
--        hafta kuni NOTO'G'RI aniqlanardi.
-- =====================================================
create or replace function join_queue(
  p_branch_id uuid,
  p_customer_name text,
  p_type text default 'online'
)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue        queues%rowtype;
  v_number       integer;
  v_ticket       tickets%rowtype;
  v_is_open      boolean;
  v_now          timestamp;
  v_day_key      text;
  v_day_schedule jsonb;
  v_open         time;
  v_close        time;
begin
  if p_type not in ('online', 'offline') then
    raise exception 'invalid ticket type: %', p_type;
  end if;

  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'customer name required';
  end if;

  v_now := now() at time zone 'Asia/Tashkent';

  -- (a) favqulodda "bugun yopiq" holati
  select is_open into v_is_open from branches where id = p_branch_id;
  if v_is_open is null then
    raise exception 'branch not found';
  end if;
  if not v_is_open then
    raise exception 'Filial bugun texnik sabablarga ko''ra ishlamaydi';
  end if;

  -- (b.1) aniq sana istisnosi (masalan bayram kuni)
  if exists (
    select 1 from branch_schedule_overrides
    where branch_id = p_branch_id and date = v_now::date and is_closed = true
  ) then
    raise exception 'Filial bugun ishlamaydi';
  end if;

  -- (b.2) haftalik jadval: dam olish kuni va ish soatlari
  v_day_key := (array['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])[extract(isodow from v_now)::int];
  select weekly_schedule -> v_day_key into v_day_schedule from branches where id = p_branch_id;

  if v_day_schedule is not null then
    if coalesce((v_day_schedule ->> 'closed')::boolean, false) then
      raise exception 'Bugun dam olish kuni';
    end if;

    begin
      v_open  := (v_day_schedule ->> 'open')::time;
      v_close := (v_day_schedule ->> 'close')::time;
    exception when others then
      v_open := null; v_close := null; -- format buzuq bo'lsa soat tekshiruvi o'tkazib yuboriladi
    end;

    if v_open is not null and v_close is not null
       and (v_now::time < v_open or v_now::time >= v_close) then
      raise exception 'Filial hozir yopiq (ish vaqti: % - %)', to_char(v_open, 'HH24:MI'), to_char(v_close, 'HH24:MI');
    end if;
  end if;

  -- (c) online: bitta foydalanuvchida bitta faol chipta (istalgan filialda)
  if p_type = 'online' then
    if auth.uid() is null then
      raise exception 'not authorized';
    end if;
    if exists (
      select 1 from tickets
      where user_id = auth.uid() and status in ('waiting', 'current')
    ) then
      raise exception 'Sizda allaqachon faol navbat bor';
    end if;
  end if;

  -- walk-in (offline) faqat filial admini uchun
  if p_type = 'offline' and not is_branch_admin(p_branch_id) then
    raise exception 'not authorized to add walk-in';
  end if;

  insert into queues (branch_id) values (p_branch_id)
  on conflict (branch_id) do nothing;

  select * into v_queue from queues where branch_id = p_branch_id for update;

  v_number := v_queue.next_num;

  insert into tickets (
    branch_id, queue_id, user_id, number, customer_name, type, status, sort_order
  )
  values (
    p_branch_id,
    v_queue.id,
    case when p_type = 'online' then auth.uid() else null end,
    v_number,
    p_customer_name,
    p_type,
    'waiting',
    v_number
  )
  returning * into v_ticket;

  update queues set next_num = v_number + 1 where id = v_queue.id;

  return v_ticket;
end;
$$;
