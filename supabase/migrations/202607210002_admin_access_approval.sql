alter table public.admin_users
add column if not exists role text not null default 'admin'
check (role in ('owner', 'admin'));

create table if not exists public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default 'Native Admin',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

alter table public.admin_access_requests enable row level security;

create or replace function public.bootstrap_native_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) = 'junpyokim0106@gmail.com' then
    insert into public.admin_users (user_id, display_name, role)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', '김준표'), 'owner')
    on conflict (user_id) do update set role = 'owner';
  end if;
  return new;
end;
$$;

drop trigger if exists native_owner_on_signup on auth.users;
create trigger native_owner_on_signup
after insert or update of email on auth.users
for each row execute function public.bootstrap_native_owner();

insert into public.admin_users (user_id, display_name, role)
select id, coalesce(raw_user_meta_data ->> 'display_name', '김준표'), 'owner'
from auth.users
where lower(email) = 'junpyokim0106@gmail.com'
on conflict (user_id) do update set role = 'owner';
