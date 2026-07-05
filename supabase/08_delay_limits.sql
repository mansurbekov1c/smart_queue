-- =====================================================
-- Smart Queue — kechiktirish cheklovlari (ticket boshiga max 2 marta,
-- pozitsiya haqiqiy odamlar soni bilan cheklangan)
-- Idempotent.
-- =====================================================

-- 1) tickets.delay_count
alter table tickets add column if not exists delay_count integer not null default 0;

-- 2) delay_ticket — to'liq qayta yaratiladi
create or replace function delay_ticket(p_ticket_id uuid, p_positions int)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket     tickets%rowtype;
  v_available  integer;
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

  -- 1) ticket boshiga kechiktirish limiti (max 2 marta)
  if v_ticket.delay_count >= 2 then
    raise exception 'Bu filialda kechiktirish limitiga yetdingiz';
  end if;

  -- coin tekshiruvi (faqat online/mijozga bog'langan chiptalar uchun)
  if v_ticket.user_id is not null then
    select coins into v_coins from profiles where id = v_ticket.user_id;
    if coalesce(v_coins, 0) < 10 then
      raise exception 'Yetarli coin yo''q';
    end if;
  end if;

  perform 1 from queues where branch_id = v_ticket.branch_id for update;

  -- 3) pozitsiya tekshiruvi — o'zidan keyin haqiqatan nechta kishi bor
  select count(*) into v_available
  from tickets
  where branch_id = v_ticket.branch_id and status = 'waiting' and sort_order > v_ticket.sort_order;

  if p_positions > v_available then
    raise exception 'Sizdan keyin navbatda faqat % kishi bor', v_available;
  end if;

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

  update tickets
  set sort_order = v_new, delay_count = delay_count + 1
  where id = p_ticket_id
  returning * into v_ticket;

  -- coin muvaffaqiyatli kechiktirilgandan keyin yechiladi
  if v_ticket.user_id is not null then
    insert into coin_transactions (user_id, amount, reason, branch_id)
    values (v_ticket.user_id, -10, 'delay_spent', v_ticket.branch_id);

    update profiles set coins = coins - 10 where id = v_ticket.user_id;
  end if;

  return v_ticket;
end;
$$;
