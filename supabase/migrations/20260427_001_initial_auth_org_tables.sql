create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'manager', 'member');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  manager_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint teams_name_unique unique (name)
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  contact_name text,
  contact_email text,
  status text not null default 'active',
  priority_tier text not null default 'standard',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint companies_status_check check (status in ('active', 'inactive')),
  constraint companies_priority_tier_check check (
    priority_tier in ('standard', 'priority', 'vip')
  )
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role public.app_role not null default 'member',
  job_title text,
  avatar_url text,
  team_id uuid references public.teams (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_email_unique unique (email)
);

alter table public.teams
  add constraint teams_manager_id_fkey
  foreign key (manager_id)
  references public.profiles (id)
  on delete set null;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_team_id_idx on public.profiles (team_id);
create index if not exists teams_manager_id_idx on public.teams (manager_id);
create index if not exists companies_status_idx on public.companies (status);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.get_my_team_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_my_role() = 'admin', false);
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_my_role() = 'manager', false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.ensure_profile_for_current_user()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user auth.users%rowtype;
  current_profile public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into auth_user
  from auth.users
  where id = auth.uid();

  if auth_user.id is null then
    raise exception 'Authenticated user not found in auth.users';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url
  )
  values (
    auth_user.id,
    coalesce(
      auth_user.raw_user_meta_data ->> 'full_name',
      split_part(auth_user.email, '@', 1)
    ),
    auth_user.email,
    auth_user.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
        updated_at = timezone('utc', now());

  returning *
  into current_profile;

  return current_profile;
end;
$$;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.companies enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or (
    public.is_manager()
    and team_id = public.get_my_team_id()
  )
  or public.is_admin()
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
)
with check (
  id = auth.uid()
  or public.is_admin()
);

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  or public.is_admin()
);

drop policy if exists "teams_select_related_or_admin" on public.teams;
create policy "teams_select_related_or_admin"
on public.teams
for select
to authenticated
using (
  id = public.get_my_team_id()
  or manager_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "teams_admin_manage" on public.teams;
create policy "teams_admin_manage"
on public.teams
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "companies_authenticated_read" on public.companies;
create policy "companies_authenticated_read"
on public.companies
for select
to authenticated
using (true);

drop policy if exists "companies_admin_manage" on public.companies;
create policy "companies_admin_manage"
on public.companies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.get_my_role() to authenticated;
grant execute on function public.get_my_team_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_manager() to authenticated;
grant execute on function public.ensure_profile_for_current_user() to authenticated;
