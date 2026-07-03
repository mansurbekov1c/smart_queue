-- =====================================================
-- Smart Queue — likes (sevimlilar) jadvali
-- Faqat bo'sh struktura, mock ma'lumot yo'q. Idempotent.
-- =====================================================

create table if not exists likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  branch_id   uuid not null references branches (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, branch_id)
);

create index if not exists likes_user_id_idx on likes (user_id);
create index if not exists likes_branch_id_idx on likes (branch_id);

alter table likes enable row level security;

-- Foydalanuvchi faqat o'z like'larini ko'ra/qo'sha/o'chira oladi
create policy likes_select_own on likes
  for select using (auth.uid() = user_id);

create policy likes_insert_own on likes
  for insert with check (auth.uid() = user_id);

create policy likes_delete_own on likes
  for delete using (auth.uid() = user_id);
