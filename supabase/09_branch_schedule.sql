-- =====================================================
-- Smart Queue — Filial ish jadvali (weekly_schedule, istisnolar,
-- favqulodda "bugun yopiq") + join_queue'ga jadval tekshiruvi.
-- Faqat struktura + logika, mock ma'lumot yo'q. Idempotent.
-- =====================================================

-- 1) branches.weekly_schedule
-- Format: {"mon": {"open":"09:00","close":"21:00","closed":false}, "tue": {...}, ...}
-- NULL = hali sozlanmagan, tekshiruv o'tkazib yuboriladi (cheklov yo'q).
alter table branches add column if not exists weekly_schedule jsonb;

-- 2) branch_schedule_overrides — aniq sanalar uchun istisno (masalan bayram)
create table if not exists branch_schedule_overrides (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references branches (id) on delete cascade,
  date        date not null,
  is_closed   boolean not null default true,
  open_time   time,
  close_time  time,
  created_at  timestamptz not null default now(),
  unique (branch_id, date)
);

create index if not exists branch_schedule_overrides_branch_date_idx
  on branch_schedule_overrides (branch_id, date);

alter table branch_schedule_overrides enable row level security;

-- hamma o'qiy oladi (mijozlar filial jadvalini ko'rishi kerak)
create policy branch_schedule_overrides_select_all on branch_schedule_overrides
  for select using (true);

-- faqat shu filial admini yoki super_admin yoza/o'zgartira/o'chira oladi
create policy branch_schedule_overrides_insert_admin on branch_schedule_overrides
  for insert with check (is_branch_admin(branch_id));

create policy branch_schedule_overrides_update_admin on branch_schedule_overrides
  for update using (is_branch_admin(branch_id));

create policy branch_schedule_overrides_delete_admin on branch_schedule_overrides
  for delete using (is_branch_admin(branch_id));

-- 3) tickets.status ga 'cancelled_by_branch' qo'shish
--    (favqulodda yopilganda waiting/current ticketlar shu holatga o'tadi —
--    oddiy 'rejected'dan farqli, chunki sabab mijoz emas, filial tomonidan)
alter table tickets drop constraint if exists tickets_status_check;
alter table tickets add constraint tickets_status_check
  check (status in ('waiting', 'current', 'done', 'rejected', 'cancelled_by_branch'));

-- 4) Trigger: admin "bugun favqulodda yopish"ni yoqqanda (is_open: true -> false)
--    barcha waiting/current ticketlar 'cancelled_by_branch' bilan yopiladi.
create or replace function handle_branch_emergency_close()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_open = false and old.is_open = true then
    update tickets
    set status = 'cancelled_by_branch'
    where branch_id = new.id and status in ('waiting', 'current');
  end if;
  return new;
end;
$$;

drop trigger if exists branches_emergency_close on branches;
create trigger branches_emergency_close
  after update on branches
  for each row execute function handle_branch_emergency_close();

-- 5) join_queue — is_open va jadval (override + weekly_schedule) tekshiruvi qo'shildi
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
  v_day_key      text;
  v_day_schedule jsonb;
begin
  if p_type not in ('online', 'offline') then
    raise exception 'invalid ticket type: %', p_type;
  end if;

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
    where branch_id = p_branch_id and date = current_date and is_closed = true
  ) then
    raise exception 'Filial bugun ishlamaydi';
  end if;

  -- (b.2) haftalik jadval bo'yicha (dam olish kuni va h.k.)
  v_day_key := (array['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])[extract(isodow from current_date)::int];
  select weekly_schedule -> v_day_key into v_day_schedule from branches where id = p_branch_id;
  if v_day_schedule is not null and coalesce((v_day_schedule ->> 'closed')::boolean, false) then
    raise exception 'Bugun dam olish kuni';
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
