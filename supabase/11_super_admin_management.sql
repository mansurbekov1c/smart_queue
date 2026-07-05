-- =====================================================
-- Smart Queue — Super Admin Paneli uchun backend (SQL/RLS)
-- Frontend (SuperAdminHomeScreen, SuperAdminBranchDetailScreen,
-- SuperAdminAdminDetailScreen, api/superadmin.js) allaqachon tayyor —
-- bu fayl faqat ularga kerakli ma'lumot va ruxsatlarni ta'minlaydi.
-- Idempotent: qayta ishga tushirsa ham xavfsiz. Mock ma'lumot yo'q.
-- =====================================================

-- =====================================================
-- 1) profiles.email — mavjud foydalanuvchilar uchun bir martalik backfill
-- =====================================================
alter table profiles add column if not exists email text;

update profiles
set email = auth.users.email
from auth.users
where profiles.id = auth.users.id
  and profiles.email is null;

-- =====================================================
-- 2) handle_new_user() — bundan buyon email ham avtomatik saqlansin
--    (03_customer_auth_trigger.sql dagi funksiyaning yangilangan versiyasi)
-- =====================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, phone, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger allaqachon on_auth_user_created nomi bilan shu funksiyaga bog'langan
-- (03_customer_auth_trigger.sql), funksiyani create or replace qilish yetarli.

-- =====================================================
-- 3) is_super_admin() — is_branch_admin() (02_queue_functions.sql) bilan
--    bir xil uslubda, RLS'da rekursiyasiz ishlatish uchun
-- =====================================================
create or replace function is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  );
$$;

grant execute on function is_super_admin() to authenticated;

-- =====================================================
-- 4) Yangi RLS policy'lar — mavjudlariga QO'SHIMCHA
--    (profiles_select_own, profiles_update_own, branches_update_own_admin
--    va h.k. o'zgarishsiz qoladi; bir nechta policy bir xil amal uchun
--    mavjud bo'lsa, ulardan BIRI o'tsa kifoya — RLS ularni OR bilan qo'shadi)
-- =====================================================
drop policy if exists profiles_select_super_admin on profiles;
create policy profiles_select_super_admin on profiles
  for select using (is_super_admin());

drop policy if exists profiles_update_super_admin on profiles;
create policy profiles_update_super_admin on profiles
  for update using (is_super_admin());

drop policy if exists branches_insert_super_admin on branches;
create policy branches_insert_super_admin on branches
  for insert with check (is_super_admin());

drop policy if exists branches_delete_super_admin on branches;
create policy branches_delete_super_admin on branches
  for delete using (is_super_admin());
