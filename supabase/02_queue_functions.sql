-- =====================================================
-- Smart Queue — Navbat RPC funksiyalari + Realtime
-- schema.sql ishga tushirilgandan KEYIN ishga tushiring.
-- Barchasi idempotent: qayta ishga tushirsa ham xavfsiz.
-- Mock/namuna ma'lumot yo'q.
-- =====================================================

-- ---------- 0) tickets.sort_order (navbat tartibi uchun) ----------
-- number = o'zgarmas chipta raqami (mijozga ko'rinadigan).
-- sort_order = navbatdagi tartib (kechiktirishda faqat shu o'zgaradi, number emas).
alter table tickets add column if not exists sort_order numeric;
update tickets set sort_order = number where sort_order is null;
create index if not exists tickets_sort_order_idx on tickets (branch_id, sort_order);

-- =====================================================
-- Yordamchi: joriy foydalanuvchi shu filialning adminmi (yoki super_admin)?
-- =====================================================
create or replace function is_branch_admin(p_branch_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and (
        profiles.role = 'super_admin'
        or (profiles.role = 'admin' and profiles.branch_id = p_branch_id)
      )
  );
$$;

-- =====================================================
-- 1) join_queue — navbatga yozilish (concurrency-safe)
--    queue rowni FOR UPDATE bilan lock qiladi → ikki kishi bir vaqtda
--    yozilsa ham number takrorlanmaydi.
--    type='online'  → mijoz o'zi (user_id = auth.uid())
--    type='offline' → admin qo'shgan walk-in (faqat branch admin chaqira oladi)
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
  v_queue   queues%rowtype;
  v_number  integer;
  v_ticket  tickets%rowtype;
begin
  if p_type not in ('online', 'offline') then
    raise exception 'invalid ticket type: %', p_type;
  end if;

  -- walk-in (offline) faqat filial admini uchun
  if p_type = 'offline' and not is_branch_admin(p_branch_id) then
    raise exception 'not authorized to add walk-in';
  end if;

  -- queue row mavjudligini ta'minlaymiz (idempotent), so'ng lock qilamiz
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

-- =====================================================
-- 2) advance_queue — adminNext: joriyni 'done' qilib, keyingiga o'tish
--    va queues.current_num ni yangilash. Keyingi waiting chiptani qaytaradi
--    (navbat bo'sh bo'lsa null).
-- =====================================================
create or replace function advance_queue(p_branch_id uuid)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue queues%rowtype;
  v_next  tickets%rowtype;
begin
  if not is_branch_admin(p_branch_id) then
    raise exception 'not authorized';
  end if;

  select * into v_queue from queues where branch_id = p_branch_id for update;
  if not found then
    raise exception 'queue not found for branch %', p_branch_id;
  end if;

  update tickets set status = 'done'
  where branch_id = p_branch_id and status = 'current';

  select * into v_next
  from tickets
  where branch_id = p_branch_id and status = 'waiting'
  order by sort_order asc
  limit 1;

  if found then
    update tickets set status = 'current' where id = v_next.id;
    update queues set current_num = v_next.number where id = v_queue.id;
    return v_next;
  end if;

  return null;
end;
$$;

-- =====================================================
-- 3) reject_current — adminReject: joriyni 'rejected' qilib, keyingiga o'tish
-- =====================================================
create or replace function reject_current(p_branch_id uuid)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue queues%rowtype;
  v_next  tickets%rowtype;
begin
  if not is_branch_admin(p_branch_id) then
    raise exception 'not authorized';
  end if;

  select * into v_queue from queues where branch_id = p_branch_id for update;
  if not found then
    raise exception 'queue not found for branch %', p_branch_id;
  end if;

  update tickets set status = 'rejected'
  where branch_id = p_branch_id and status = 'current';

  select * into v_next
  from tickets
  where branch_id = p_branch_id and status = 'waiting'
  order by sort_order asc
  limit 1;

  if found then
    update tickets set status = 'current' where id = v_next.id;
    update queues set current_num = v_next.number where id = v_queue.id;
    return v_next;
  end if;

  return null;
end;
$$;

-- =====================================================
-- 4) reject_ticket — adminRejectItem: navbatdagi aniq bir chiptani rad etish
--    (joriy xizmatdagini emas, kutayotgan birini)
-- =====================================================
create or replace function reject_ticket(p_ticket_id uuid)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket tickets%rowtype;
begin
  select * into v_ticket from tickets where id = p_ticket_id;
  if not found then
    raise exception 'ticket not found';
  end if;

  if not is_branch_admin(v_ticket.branch_id) then
    raise exception 'not authorized';
  end if;

  update tickets set status = 'rejected'
  where id = p_ticket_id
  returning * into v_ticket;

  return v_ticket;
end;
$$;

-- =====================================================
-- 5) delay_ticket — doDelay / adminDelayItem
--    Chiptani navbatda p_positions ta orqaga suradi (number O'ZGARMAYDI,
--    faqat sort_order). Ticket egasi yoki filial admini chaqira oladi.
-- =====================================================
create or replace function delay_ticket(p_ticket_id uuid, p_positions int)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket     tickets%rowtype;
  v_nth        numeric;   -- orqadagi N-chi chiptaning sort_order'i
  v_next_after numeric;   -- undan keyingi (N+1) chiptaning sort_order'i
  v_new        numeric;
begin
  if p_positions is null or p_positions < 1 then
    raise exception 'positions must be >= 1';
  end if;

  select * into v_ticket from tickets where id = p_ticket_id;
  if not found then
    raise exception 'ticket not found';
  end if;

  -- admin, yoki ticket egasi (auth), yoki anon mijoz (capability = ticket UUID).
  -- Eslatma: mijoz auth hali Supabase'ga ko'chirilmagani uchun anon (auth.uid() null) ham
  -- o'z ticketini kechiktira oladi. Mijoz auth ko'chgach, "auth.uid() is null" ni olib tashlang.
  if not (is_branch_admin(v_ticket.branch_id) or v_ticket.user_id = auth.uid() or auth.uid() is null) then
    raise exception 'not authorized';
  end if;

  if v_ticket.status <> 'waiting' then
    raise exception 'only waiting tickets can be delayed';
  end if;

  -- tartibni serializatsiya qilish uchun queue rowni lock qilamiz
  perform 1 from queues where branch_id = v_ticket.branch_id for update;

  -- o'zidan orqadagi (kattaroq sort_order) waiting chiptalar orasidan N-chisi
  select sort_order into v_nth
  from tickets
  where branch_id = v_ticket.branch_id and status = 'waiting'
    and sort_order > v_ticket.sort_order
  order by sort_order asc
  offset (p_positions - 1) limit 1;

  if v_nth is null then
    -- orqada N tadan kam chipta bor → eng oxiriga surib qo'yamiz
    select coalesce(max(sort_order), v_ticket.sort_order) + 1 into v_new
    from tickets
    where branch_id = v_ticket.branch_id and status = 'waiting' and id <> p_ticket_id;
  else
    select sort_order into v_next_after
    from tickets
    where branch_id = v_ticket.branch_id and status = 'waiting'
      and sort_order > v_nth
    order by sort_order asc
    limit 1;

    if v_next_after is null then
      v_new := v_nth + 1;                 -- N-chidan keyin oxirgi bo'lsa
    else
      v_new := (v_nth + v_next_after) / 2; -- N-chi va (N+1)-chi orasiga
    end if;
  end if;

  update tickets set sort_order = v_new where id = p_ticket_id
  returning * into v_ticket;

  return v_ticket;
end;
$$;

-- =====================================================
-- 6) leave_queue — mijoz navbatdan chiqadi (o'z ticketini bekor qiladi)
-- =====================================================
create or replace function leave_queue(p_ticket_id uuid)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket tickets%rowtype;
begin
  update tickets set status = 'rejected'
  where id = p_ticket_id and status in ('waiting', 'current')
  returning * into v_ticket;

  return v_ticket;
end;
$$;

-- =====================================================
-- Ruxsatlar
-- =====================================================
grant execute on function is_branch_admin(uuid)              to authenticated;
grant execute on function advance_queue(uuid)                to authenticated;
grant execute on function reject_current(uuid)               to authenticated;
grant execute on function reject_ticket(uuid)                to authenticated;
-- Mijoz operatsiyalari: anon ham chaqira oladi (mijoz auth hali mock/local).
grant execute on function join_queue(uuid, text, text)       to anon, authenticated;
grant execute on function delay_ticket(uuid, int)            to anon, authenticated;
grant execute on function leave_queue(uuid)                  to anon, authenticated;

-- =====================================================
-- Realtime — tickets va queues jadvallariga obuna bo'lish uchun
-- =====================================================
alter table tickets replica identity full;
alter table queues  replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tickets'
  ) then
    alter publication supabase_realtime add table tickets;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'queues'
  ) then
    alter publication supabase_realtime add table queues;
  end if;
end $$;
