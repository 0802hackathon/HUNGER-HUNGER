-- Keep project management behind ownership-checking database functions. The
-- placeholder cleanup is deliberately strict and aborts if the target set no
-- longer consists of exactly the two reported projects.
do $$
declare
  v_target_ids uuid[];
  v_target_count integer;
  v_deleted_count integer;
begin
  select array_agg(id order by id), count(*)
  into v_target_ids, v_target_count
  from public.projects
  where title like 'ああああ%'
     or title like 'いいいいいいいい%';

  -- Fresh databases and databases where this cleanup already ran need no action.
  if v_target_count = 0 then
    return;
  end if;

  if v_target_count <> 2 then
    raise exception 'expected exactly 2 placeholder projects, found %',
      v_target_count;
  end if;

  -- These records were created while exercising the two placeholder projects,
  -- so remove their dependent activity in foreign-key-safe order. The strict
  -- two-project check above keeps this cleanup from affecting other projects.
  delete from public.progress_updates
  where exploration_id in (
    select id
    from public.project_explorations
    where project_id = any(v_target_ids)
  );

  delete from public.learning_outcomes
  where exploration_id in (
    select id
    from public.project_explorations
    where project_id = any(v_target_ids)
  );

  delete from public.project_continuations
  where source_project_id = any(v_target_ids);

  delete from public.project_explorations
  where project_id = any(v_target_ids);

  delete from public.projects
  where id = any(v_target_ids);

  get diagnostics v_deleted_count = row_count;
  if v_deleted_count <> 2 then
    raise exception 'expected to delete 2 placeholder projects, deleted %',
      v_deleted_count;
  end if;
end;
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
  if v_project.owner_profile_id <> v_profile_id then
    raise exception 'project owner required' using errcode = '42501';
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
  if v_project.owner_profile_id <> v_profile_id then
    raise exception 'project owner required' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.project_explorations
    where project_id = p_project_id
  ) or exists (
    select 1
    from public.project_continuations
    where source_project_id = p_project_id
  ) then
    raise exception 'project has learning activity';
  end if;

  delete from public.projects
  where id = p_project_id;

  return p_project_id;
end;
$$;

revoke all on function public.archive_owned_project(uuid, text)
from public, anon;
revoke all on function public.delete_owned_project(uuid)
from public, anon;
grant execute on function public.archive_owned_project(uuid, text)
to authenticated;
grant execute on function public.delete_owned_project(uuid)
to authenticated;

-- Direct table writes are unnecessary now that every management action goes
-- through a server-validated function and RLS remains enabled.
revoke update, delete on table public.projects from anon, authenticated;
