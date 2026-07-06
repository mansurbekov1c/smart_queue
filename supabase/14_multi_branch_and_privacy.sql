-- =====================================================
-- Smart Queue — Ko'p-filialli navbat + chipta maxfiyligi
--   A) join_queue: "umuman bitta faol chipta" -> "har filialga bitta"
--      (mijoz turli filiallarga bir vaqtda yozila oladi, lekin bitta
--       filialga ikki marta emas — spam-hujumdan himoya).
--   B) tickets SELECT maxfiyligi: jonli navbat (waiting/current) hammaga
--      ochiq (navbat ro'yxati uchun kerak), lekin done/rejected/
--      cancelled_by_branch chiptalarni faqat egasi va filial admini ko'radi.
-- Idempotent. Mock ma'lumot yo'q.
-- =====================================================

-- ----- A) join_queue: har filialga bitta faol chipta -----
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

  -- online: shu FILIALDA faol chipta bo'lmasligi kerak (boshqa filiallar mumkin)
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

-- ----- B) tickets SELECT maxfiyligi -----
drop policy if exists tickets_select_all on tickets;
create policy tickets_select on tickets
  for select using (
    status in ('waiting', 'current')   -- jonli navbat: hammaga ochiq
    or user_id = auth.uid()            -- o'z tarixi
    or is_branch_admin(branch_id)      -- filial admini o'z filialining hammasini
  );
