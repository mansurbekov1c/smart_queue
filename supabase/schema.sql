-- =====================================================
-- Smart Queue — Supabase schema
-- Faqat bo'sh jadval strukturasi. Namuna (mock) ma'lumot yo'q.
-- Kodda ishlatilayotgan maydon nomlariga mos: places.js / AppContext.js
-- =====================================================

create extension if not exists pgcrypto;

-- ---------- helper: updated_at avtomatik yangilanishi ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- 1) branches — filiallar (eski PLACES massivi o'rniga)
-- =====================================================
create table if not exists branches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null check (category in ('barber', 'clinic', 'bank', 'carwash', 'gov')),
  city          text not null,
  district      text not null,
  address       text not null,
  lat           double precision,
  lng           double precision,
  rating        numeric(2, 1) not null default 0,
  review_count  integer not null default 0,
  hours         text,
  is_open       boolean not null default true,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger branches_set_updated_at
  before update on branches
  for each row execute function set_updated_at();

-- =====================================================
-- 2) profiles — foydalanuvchi profili (auth.users kengaytmasi)
--    customer va admin bir xil jadvalda, role orqali ajratiladi.
--    Admin filialga branch_id orqali bog'lanadi.
-- =====================================================
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  phone       text unique,
  first_name  text,
  last_name   text,
  role        text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  branch_id   uuid references branches (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_branch_id_idx on profiles (branch_id);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- =====================================================
-- 3) queues — har bir filialning joriy navbat holati
--    (currentNum / adminNextNum o'rnini bosadi)
-- =====================================================
create table if not exists queues (
  id           uuid primary key default gen_random_uuid(),
  branch_id    uuid not null unique references branches (id) on delete cascade,
  current_num  integer not null default 0,
  next_num     integer not null default 1,
  is_open      boolean not null default true,
  updated_at   timestamptz not null default now()
);

create trigger queues_set_updated_at
  before update on queues
  for each row execute function set_updated_at();

-- =====================================================
-- 4) tickets — navbatdagi har bir chipta (eski queue[] elementlari)
-- =====================================================
create table if not exists tickets (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references branches (id) on delete cascade,
  queue_id       uuid not null references queues (id) on delete cascade,
  user_id        uuid references profiles (id) on delete set null,
  number         integer not null,
  customer_name  text not null,
  type           text not null default 'offline' check (type in ('online', 'offline')),
  status         text not null default 'waiting' check (status in ('waiting', 'current', 'done', 'rejected')),
  sort_order     numeric,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (branch_id, number)
);

create index if not exists tickets_branch_id_idx on tickets (branch_id);
create index if not exists tickets_queue_id_idx on tickets (queue_id);
create index if not exists tickets_user_id_idx on tickets (user_id);
create index if not exists tickets_status_idx on tickets (status);
create index if not exists tickets_sort_order_idx on tickets (branch_id, sort_order);

create trigger tickets_set_updated_at
  before update on tickets
  for each row execute function set_updated_at();

-- =====================================================
-- Row Level Security
-- =====================================================
alter table branches enable row level security;
alter table profiles enable row level security;
alter table queues enable row level security;
alter table tickets enable row level security;

-- branches: hamma o'qiy oladi, o'z filialining admini yangilay oladi
create policy branches_select_all on branches
  for select using (true);

create policy branches_update_own_admin on branches
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and (
          profiles.role = 'super_admin'
          or (profiles.role = 'admin' and profiles.branch_id = branches.id)
        )
    )
  );

-- profiles: foydalanuvchi faqat o'z profilini ko'radi/yangilaydi
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);

create policy profiles_insert_own on profiles
  for insert with check (auth.uid() = id);

create policy profiles_update_own on profiles
  for update using (auth.uid() = id);

-- queues: hamma o'qiy oladi, o'z filialining admini yangilay oladi
create policy queues_select_all on queues
  for select using (true);

create policy queues_update_own_admin on queues
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and (
          profiles.role = 'super_admin'
          or (profiles.role = 'admin' and profiles.branch_id = queues.branch_id)
        )
    )
  );

-- tickets: hamma o'qiy oladi; mijoz o'zi uchun qo'sha oladi,
-- filial admini o'z filialidagi chiptalarni boshqara oladi
create policy tickets_select_all on tickets
  for select using (true);

create policy tickets_insert_self_or_admin on tickets
  for insert with check (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and (
          profiles.role = 'super_admin'
          or (profiles.role = 'admin' and profiles.branch_id = tickets.branch_id)
        )
    )
  );

create policy tickets_update_own_admin on tickets
  for update using (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and (
          profiles.role = 'super_admin'
          or (profiles.role = 'admin' and profiles.branch_id = tickets.branch_id)
        )
    )
  );
