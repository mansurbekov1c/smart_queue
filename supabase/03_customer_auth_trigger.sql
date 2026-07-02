-- =====================================================
-- Smart Queue — mijoz ro'yxatdan o'tganda profiles'ga avtomatik yozuv
-- Idempotent: qayta ishga tushirsa ham xavfsiz.
-- =====================================================

-- signUp() chaqirilganda options.data ichida yuborilgan first_name/last_name/phone
-- auth.users.raw_user_meta_data'ga tushadi — trigger shulardan profiles yozuvini yaratadi.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, phone, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
