-- =====================================================
-- Smart Queue — o'rtacha xizmat vaqtini avtomatik hisoblash
-- (waitMin endi waitingCount * avg_service_minutes bo'ladi)
-- Faqat struktura + logika, mock ma'lumot yo'q. Idempotent.
-- =====================================================

-- 1) branches ustunlari
alter table branches add column if not exists avg_service_minutes integer not null default 15;
alter table branches add column if not exists service_sample_count integer not null default 0;
alter table branches add column if not exists schedule_calibrated_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'branches_avg_service_minutes_check') then
    alter table branches add constraint branches_avg_service_minutes_check check (avg_service_minutes > 0);
  end if;
end $$;

-- =====================================================
-- 2) Admin qo'lda avg_service_minutes'ni o'zgartirganda —
--    service_sample_count'ni 0'ga tushirish (qayta hisoblashni boshidan
--    boshlash uchun), shunda keyingi avtomatik hisoblash uni darhol
--    qayta bosib yozmaydi (20 tagacha yig'ilishi kerak bo'ladi).
--    Farqlash usuli: agar avg_service_minutes o'zgargan-u,
--    schedule_calibrated_at O'ZGARMAGAN bo'lsa — bu qo'lda tahrirlash
--    (avtomatik trigger ikkalasini bir vaqtda birga o'zgartiradi).
-- =====================================================
create or replace function handle_branch_manual_schedule_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.avg_service_minutes is distinct from old.avg_service_minutes
     and new.schedule_calibrated_at is not distinct from old.schedule_calibrated_at then
    new.service_sample_count := 0;
    new.schedule_calibrated_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists branches_manual_schedule_edit on branches;
create trigger branches_manual_schedule_edit
  before update on branches
  for each row execute function handle_branch_manual_schedule_edit();

-- =====================================================
-- 3) Trigger: ticket 'done' bo'lganda service_sample_count +1,
--    20taga yetgach (va undan keyin har safar) so'nggi 20 ta 'done'
--    ticketning haqiqiy o'rtacha davomiyligini (created_at→updated_at)
--    hisoblab, avg_service_minutes'ni yangilaydi va
--    schedule_calibrated_at'ni belgilaydi (frontend shu orqali
--    "yangilandi" bildirishnomasini bilib oladi).
-- =====================================================
create or replace function update_branch_avg_service_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_count   integer;
  v_avg_minutes numeric;
begin
  if new.status <> 'done' or old.status = 'done' then
    return new;
  end if;

  update branches
  set service_sample_count = service_sample_count + 1
  where id = new.branch_id
  returning service_sample_count into v_new_count;

  if v_new_count >= 20 then
    select avg(extract(epoch from (updated_at - created_at)) / 60.0)
    into v_avg_minutes
    from (
      select updated_at, created_at
      from tickets
      where branch_id = new.branch_id and status = 'done'
      order by updated_at desc
      limit 20
    ) recent;

    if v_avg_minutes is not null then
      update branches
      set avg_service_minutes = greatest(1, round(v_avg_minutes))::integer,
          schedule_calibrated_at = now()
      where id = new.branch_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tickets_update_avg_service_time on tickets;
create trigger tickets_update_avg_service_time
  after update on tickets
  for each row execute function update_branch_avg_service_time();
