-- =====================================================
-- Smart Queue — anon ruxsatini yopish (mijoz auth Supabase'ga o'tgach)
-- Idempotent.
-- =====================================================

-- =====================================================
-- 1) leave_queue — endi ticket egasi yoki filial admini bo'lishi shart
--    (avval hech qanday authz tekshiruvi yo'q edi — istalgan kim ticket
--    ID'ni bilsa, uni bekor qila olardi)
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
  select * into v_ticket from tickets where id = p_ticket_id;
  if not found then
    raise exception 'ticket not found';
  end if;

  if not (v_ticket.user_id = auth.uid() or is_branch_admin(v_ticket.branch_id)) then
    raise exception 'not authorized';
  end if;

  update tickets set status = 'rejected'
  where id = p_ticket_id and status in ('waiting', 'current')
  returning * into v_ticket;

  return v_ticket;
end;
$$;

-- =====================================================
-- 2) delay_ticket — "auth.uid() is null" fallback olib tashlandi
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

  return v_ticket;
end;
$$;

-- =====================================================
-- 3) anon ruxsatini olib tashlash — endi faqat authenticated
-- =====================================================
revoke execute on function join_queue(uuid, text, text) from anon;
revoke execute on function delay_ticket(uuid, int)      from anon;
revoke execute on function leave_queue(uuid)             from anon;

grant execute on function join_queue(uuid, text, text) to authenticated;
grant execute on function delay_ticket(uuid, int)      to authenticated;
grant execute on function leave_queue(uuid)             to authenticated;
