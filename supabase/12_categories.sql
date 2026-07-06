-- =====================================================
-- Smart Queue — kategoriyalar jadvali (super admin boshqaradigan,
-- mijoz Bosh sahifasi bilan bir xil tartibda)
-- Faqat struktura + haqiqiy (mock emas) boshlang'ich taksonomiya.
-- Idempotent.
-- =====================================================

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists categories_sort_order_idx on categories (sort_order);

alter table categories enable row level security;

-- hamma o'qiy oladi (mijoz Bosh sahifasi ham shu ro'yxatdan foydalanadi)
create policy categories_select_all on categories
  for select using (true);

-- faqat super admin qo'sha/o'zgartira/o'chira oladi
create policy categories_insert_super_admin on categories
  for insert with check (is_super_admin());

create policy categories_update_super_admin on categories
  for update using (is_super_admin());

create policy categories_delete_super_admin on categories
  for delete using (is_super_admin());

-- Ilova ishga tushgandan beri ishlatilayotgan haqiqiy 5 ta kategoriya
-- (mock ma'lumot emas — bu allaqachon barcha filiallar ishlatayotgan
-- taksonomiya, jadval bo'lmasa tizim sinadi)
insert into categories (name, sort_order) values
  ('barber', 1),
  ('clinic', 2),
  ('bank', 3),
  ('carwash', 4),
  ('gov', 5)
on conflict (name) do nothing;
