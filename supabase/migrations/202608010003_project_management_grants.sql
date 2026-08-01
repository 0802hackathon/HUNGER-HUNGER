-- Keep original ownership intact while allowing explicitly granted profiles to
-- manage existing projects. New projects remain manageable by their creator.
begin;

create table if not exists public.project_management_grants (
  project_id uuid not null
    references public.projects(id) on delete cascade,
  manager_profile_id uuid not null
    references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, manager_profile_id)
);

alter table public.project_management_grants enable row level security;

drop policy if exists project_management_grants_manager_read
on public.project_management_grants;
create policy project_management_grants_manager_read
on public.project_management_grants for select to authenticated
using (
  manager_profile_id = public.current_profile_id()
  or exists (
    select 1
    from public.projects as project
    where project.id = project_id
      and project.owner_profile_id = public.current_profile_id()
  )
);

create or replace function public.can_manage_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.projects as project
    where project.id = p_project_id
      and (
        project.owner_profile_id = public.current_profile_id()
        or exists (
          select 1
          from public.project_management_grants as management_grant
          where management_grant.project_id = project.id
            and management_grant.manager_profile_id = public.current_profile_id()
        )
      )
  );
$$;

create or replace function public.archive_owned_project(
  p_project_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_project public.projects%rowtype;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_reason, ''))) not between 3 and 500 then
    raise exception 'archive reason is invalid' using errcode = '22023';
  end if;

  select * into v_project
  from public.projects
  where id = p_project_id
  for update;

  if v_project.id is null then
    raise exception 'project not found' using errcode = 'P0002';
  end if;
  if not public.can_manage_project(p_project_id) then
    raise exception 'project manager required' using errcode = '42501';
  end if;

  if v_project.status = 'archived' then
    return v_project.id;
  end if;

  update public.projects
  set status = 'archived',
      archived_at = now(),
      archive_reason = trim(p_reason)
  where id = p_project_id;

  return p_project_id;
end;
$$;

create or replace function public.delete_owned_project(p_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_project public.projects%rowtype;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  select * into v_project
  from public.projects
  where id = p_project_id
  for update;

  if v_project.id is null then
    raise exception 'project not found' using errcode = 'P0002';
  end if;
  if not public.can_manage_project(p_project_id) then
    raise exception 'project manager required' using errcode = '42501';
  end if;

  -- Learning records point to explorations with restrictive foreign keys, so
  -- delete them before their exploration and source project.
  delete from public.progress_updates
  where exploration_id in (
    select id
    from public.project_explorations
    where project_id = p_project_id
  );

  delete from public.learning_outcomes
  where exploration_id in (
    select id
    from public.project_explorations
    where project_id = p_project_id
  );

  delete from public.project_continuations
  where source_project_id = p_project_id;

  delete from public.project_explorations
  where project_id = p_project_id;

  delete from public.projects
  where id = p_project_id;

  return p_project_id;
end;
$$;

revoke all on table public.project_management_grants
from public, anon;
revoke insert, update, delete on table public.project_management_grants
from authenticated;
grant select on table public.project_management_grants to authenticated;

revoke all on function public.can_manage_project(uuid) from public, anon;
revoke all on function public.archive_owned_project(uuid, text)
from public, anon;
revoke all on function public.delete_owned_project(uuid)
from public, anon;
grant execute on function public.can_manage_project(uuid) to authenticated;
grant execute on function public.archive_owned_project(uuid, text)
to authenticated;
grant execute on function public.delete_owned_project(uuid)
to authenticated;

notify pgrst, 'reload schema';

commit;
