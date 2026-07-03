-- =====================================================
-- Smart Queue — reviews (izohlar) jadvali
-- Faqat bo'sh struktura, mock ma'lumot yo'q. Idempotent.
-- =====================================================

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references branches (id) on delete cascade,
  user_id     uuid not null references profiles (id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  text        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, branch_id)
);

create index if not exists reviews_branch_id_idx on reviews (branch_id);
create index if not exists reviews_user_id_idx on reviews (user_id);

-- =====================================================
-- Yordamchi: foydalanuvchi shu filialdan haqiqatan xizmat olganmi?
-- (tickets'da status='done' kamida bitta yozuv bormi)
-- =====================================================
create or replace function customer_has_service(p_branch_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from tickets
    where tickets.branch_id = p_branch_id
      and tickets.user_id = p_user_id
      and tickets.status = 'done'
  );
$$;

grant execute on function customer_has_service(uuid, uuid) to authenticated;

-- =====================================================
-- Himoya #2: BEFORE INSERT trigger — RLS'dan mustaqil, qo'shimcha qatlam
-- (RLS chetlab o'tilsa ham — masalan service-role orqali — shart buziladigan
-- yozuv kiritilmaydi)
-- =====================================================
create or replace function check_review_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not customer_has_service(new.branch_id, new.user_id) then
    raise exception 'Bu filialdan xizmat olmagan foydalanuvchi izoh qoldira olmaydi';
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_check_eligibility on reviews;
create trigger reviews_check_eligibility
  before insert on reviews
  for each row execute function check_review_eligibility();

-- =====================================================
-- branches.rating / review_count avtomatik yangilanishi
-- =====================================================
create or replace function update_branch_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch_id uuid := coalesce(new.branch_id, old.branch_id);
begin
  update branches
  set rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where branch_id = v_branch_id), 0),
      review_count = (select count(*) from reviews where branch_id = v_branch_id)
  where id = v_branch_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_update_branch_rating on reviews;
create trigger reviews_update_branch_rating
  after insert or update or delete on reviews
  for each row execute function update_branch_rating();

-- =====================================================
-- RLS
-- =====================================================
alter table reviews enable row level security;

-- hamma o'qiy oladi
create policy reviews_select_all on reviews
  for select using (true);

-- faqat login qilgan, shu filialdan xizmat olgan (status='done' ticket bor)
-- foydalanuvchi o'zi uchun izoh qo'sha oladi
create policy reviews_insert_eligible on reviews
  for insert with check (
    user_id = auth.uid()
    and customer_has_service(branch_id, auth.uid())
  );
