-- =====================================================
-- Smart Queue — Coin (sodiqlik) tizimi
-- Faqat struktura + logika, mock ma'lumot yo'q. Idempotent.
-- =====================================================

-- =====================================================
-- 1) profiles.coins
-- =====================================================
alter table profiles add column if not exists coins integer not null default 0;

-- =====================================================
-- 2) coin_transactions — coin tarixi (audit uchun ham kerak)
-- =====================================================
create table if not exists coin_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  amount      integer not null,               -- musbat = yig'ilgan, manfiy = sarflangan
  reason      text not null,                  -- 'first_service' | 'service' | 'delay_spent'
  branch_id   uuid references branches (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists coin_transactions_user_id_idx on coin_transactions (user_id);
create index if not exists coin_transactions_branch_id_idx on coin_transactions (branch_id);
create index if not exists coin_transactions_user_created_idx on coin_transactions (user_id, created_at);

alter table coin_transactions enable row level security;

create policy coin_transactions_select_own on coin_transactions
  for select using (auth.uid() = user_id);

-- insert/update/delete uchun policy yo'q — bu jadvalga faqat SECURITY DEFINER
-- funksiyalar (RLS'ni chetlab o'tadigan) orqali yoziladi, client to'g'ridan-to'g'ri yoza olmaydi.

-- =====================================================
-- 3) Trigger: tickets.status 'done'ga o'tganda avtomatik coin
--    - birinchi marta (umumiy hisobda, filialdan qat'i nazar): +10, 'first_service'
--      (bu bonus kunlik limitdan MUSTASNO — aks holda 10 > 6 limit bilan ziddiyat bo'lardi)
--    - keyingi har safar: +2, 'service' — lekin kunlik yig'ilgan (musbat) summa
--      allaqachon 6 ga yetgan bo'lsa, coin qo'shilmaydi (xizmat baribir ko'rsatiladi)
--    - offline (walk-in, user_id is null) chiptalar uchun coin berilmaydi
-- =====================================================
create or replace function award_service_coins()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_had_prior_done boolean;
  v_today_earned    integer;
  v_amount          integer;
  v_reason          text;
begin
  if new.status <> 'done' or old.status = 'done' or new.user_id is null then
    return new;
  end if;

  select exists (
    select 1 from tickets
    where user_id = new.user_id
      and status = 'done'
      and id <> new.id
  ) into v_had_prior_done;

  if not v_had_prior_done then
    v_amount := 10;
    v_reason := 'first_service';
  else
    select coalesce(sum(amount), 0) into v_today_earned
    from coin_transactions
    where user_id = new.user_id
      and amount > 0
      and created_at >= date_trunc('day', now());

    if v_today_earned >= 6 then
      return new;
    end if;

    v_amount := 2;
    v_reason := 'service';
  end if;

  insert into coin_transactions (user_id, amount, reason, branch_id)
  values (new.user_id, v_amount, v_reason, new.branch_id);

  update profiles set coins = coins + v_amount where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists tickets_award_coins on tickets;
create trigger tickets_award_coins
  after update on tickets
  for each row execute function award_service_coins();

-- =====================================================
-- 4) delay_ticket — coin tekshiruvi + yechish qo'shildi
--    (to'liq funksiya qayta yaratiladi, avvalgi versiyaning ustiga yoziladi)
-- =====================================================
create or replace function delay_ticket(p_ticket_id uuid, p_positions int)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket     tickets%rowtype;
  v_nth        numeric;
  v_next_after numeric;
  v_new        numeric;
  v_coins      integer;
begin
  if p_positions is null or p_positions < 1 then
    raise exception 'positions must be >= 1';
  end if;

  select * into v_ticket from tickets where id = p_ticket_id;
  if not found then
    raise exception 'ticket not found';
  end if;

  if not (is_branch_admin(v_ticket.branch_id) or v_ticket.user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  if v_ticket.status <> 'waiting' then
    raise exception 'only waiting tickets can be delayed';
  end if;

  -- coin tekshiruvi (faqat online/mijozga bog'langan chiptalar uchun)
  if v_ticket.user_id is not null then
    select coins into v_coins from profiles where id = v_ticket.user_id;
    if coalesce(v_coins, 0) < 10 then
      raise exception 'Yetarli coin yo''q';
    end if;
  end if;

  perform 1 from queues where branch_id = v_ticket.branch_id for update;

  select sort_order into v_nth
  from tickets
  where branch_id = v_ticket.branch_id and status = 'waiting'
    and sort_order > v_ticket.sort_order
  order by sort_order asc
  offset (p_positions - 1) limit 1;

  if v_nth is null then
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
      v_new := v_nth + 1;
    else
      v_new := (v_nth + v_next_after) / 2;
    end if;
  end if;

  update tickets set sort_order = v_new where id = p_ticket_id
  returning * into v_ticket;

  -- kechiktirish muvaffaqiyatli bo'lgach, coin yechiladi
  if v_ticket.user_id is not null then
    insert into coin_transactions (user_id, amount, reason, branch_id)
    values (v_ticket.user_id, -10, 'delay_spent', v_ticket.branch_id);

    update profiles set coins = coins - 10 where id = v_ticket.user_id;
  end if;

  return v_ticket;
end;
$$;
