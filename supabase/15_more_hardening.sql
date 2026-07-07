-- =====================================================
-- Smart Queue — qolgan kichik zaifliklarni tuzatish
--   #1 join_queue: bitta foydalanuvchi bitta filialga kuniga
--      cheksiz chipta ochib (join->leave->join) raqamlarni
--      va bazani "spam" qila olmasin — kunlik limit qo'shildi.
--   #2 customer_has_service: endi FAQAT joriy foydalanuvchini
--      (auth.uid()) tekshiradi — boshqa birovning user_id'sini
--      berib uning xizmat tarixini bilib olib bo'lmaydi.
-- Idempotent. Mock ma'lumot yo'q. Parol siyosati o'zgarmaydi.
-- =====================================================

-- ----- #2 avval: customer_has_service parametrini olib tashlash -----
-- (join_queue'dan oldin, chunki reviews trigger/policy shunga bog'liq emas,
--  lekin tartib muhim emas — ikkalasi mustaqil)
drop trigger if exists reviews_check_eligibility on reviews;
drop policy if exists reviews_insert_eligible on reviews;
drop function if exists customer_has_service(uuid, uuid);

create function customer_has_service(p_branch_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from tickets
    where tickets.branch_id = p_branch_id
      and tickets.user_id = auth.uid()
      and tickets.status = 'done'
  );
$$;

grant execute on function customer_has_service(uuid) to authenticated;

create or replace function check_review_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id <> auth.uid() or not customer_has_service(new.branch_id) then
    raise exception 'Bu filialdan xizmat olmagan foydalanuvchi izoh qoldira olmaydi';
  end if;
  return new;
end;
$$;

create trigger reviews_check_eligibility
  before insert on reviews
  for each row execute function check_review_eligibility();

create policy reviews_insert_eligible on reviews
  for insert with check (
    user_id = auth.uid()
    and customer_has_service(branch_id)
  );

-- ----- #1: join_queue — kunlik limit (bitta filialga kuniga max 5 marta) -----
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
  v_today_count  integer;
begin
  if p_type not in ('online', 'offline') then
    raise exception 'invalid ticket type: %', p_type;
  end if;

  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'customer name required';
  end if;

  v_now := now() at time zone 'Asia/Tashkent';

  select is_open into v_is_open from branches where id = p_branch_id;
  if v_is_open is null then
    raise exception 'branch not found';
  end if;
  if not v_is_open then
    raise exception 'Filial bugun texnik sabablarga ko''ra ishlamaydi';
  end if;

  if exists (
    select 1 from branch_schedule_overrides
    where branch_id = p_branch_id and date = v_now::date and is_closed = true
  ) then
    raise exception 'Filial bugun ishlamaydi';
  end if;

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
      v_open := null; v_close := null;
    end;

    if v_open is not null and v_close is not null
       and (v_now::time < v_open or v_now::time >= v_close) then
      raise exception 'Filial hozir yopiq (ish vaqti: % - %)', to_char(v_open, 'HH24:MI'), to_char(v_close, 'HH24:MI');
    end if;
  end if;

  if p_type = 'online' then
    if auth.uid() is null then
      raise exception 'not authorized';
    end if;

    if exists (
      select 1 from tickets
      where user_id = auth.uid()
        and branch_id = p_branch_id
        and status in ('waiting', 'current')
    ) then
      raise exception 'Sizda bu filialda allaqachon faol navbat bor';
    end if;

    -- kunlik limit: shu filialga bugun necha marta yozilgan (holatidan qat'i nazar)
    select count(*) into v_today_count
    from tickets
    where user_id = auth.uid()
      and branch_id = p_branch_id
      and created_at at time zone 'Asia/Tashkent' >= date_trunc('day', v_now);

    if v_today_count >= 5 then
      raise exception 'Bu filialga bugun juda ko''p marta yozildingiz, ertaga qayta urinib ko''ring';
    end if;
  end if;

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
