create type public.task_status as enum (
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'blocked'
);

create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create or replace function public.manages_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teams
    where id = target_team_id
      and manager_id = auth.uid()
  );
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  company_id uuid references public.companies (id) on delete set null,
  team_id uuid references public.teams (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  start_date date,
  due_date date,
  completed_at timestamptz,
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  actual_minutes integer not null default 0 check (actual_minutes >= 0),
  billable boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_priority_idx on public.tasks (priority);
create index if not exists tasks_team_id_idx on public.tasks (team_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_company_id_idx on public.tasks (company_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_created_by_idx on public.tasks (created_by);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_scoped" on public.tasks;
create policy "tasks_select_scoped"
on public.tasks
for select
to authenticated
using (
  public.is_admin()
  or public.manages_team(team_id)
  or assigned_to = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "tasks_insert_scoped" on public.tasks;
create policy "tasks_insert_scoped"
on public.tasks
for insert
to authenticated
with check (
  public.is_admin()
  or (
    public.manages_team(team_id)
    and created_by = auth.uid()
  )
  or (
    team_id = public.get_my_team_id()
    and created_by = auth.uid()
    and assigned_to = auth.uid()
  )
);

drop policy if exists "tasks_update_scoped" on public.tasks;
create policy "tasks_update_scoped"
on public.tasks
for update
to authenticated
using (
  public.is_admin()
  or public.manages_team(team_id)
  or assigned_to = auth.uid()
)
with check (
  public.is_admin()
  or public.manages_team(team_id)
  or assigned_to = auth.uid()
);

drop policy if exists "tasks_delete_scoped" on public.tasks;
create policy "tasks_delete_scoped"
on public.tasks
for delete
to authenticated
using (
  public.is_admin()
  or public.manages_team(team_id)
);

grant execute on function public.manages_team(uuid) to authenticated;
