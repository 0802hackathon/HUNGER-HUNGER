-- Sample content lives in the application bundle. Persist only each profile's
-- archive/delete preference so one learner cannot change another learner's
-- sample catalog.
begin;

create table if not exists public.sample_project_preferences (
  profile_id uuid not null
    references public.profiles(id) on delete cascade,
  sample_project_id text not null check (
    sample_project_id in (
      'study-streak',
      'meal-map',
      'voice-journal',
      'campus-lost-found',
      'accessible-reader',
      'realtime-study-room',
      'receipt-lens',
      'sensor-garden',
      'pocket-budget',
      'api-observatory',
      'subtitle-studio',
      'city-temperature-atlas'
    )
  ),
  state text not null check (state in ('archived', 'deleted')),
  archive_reason text check (
    archive_reason is null
    or char_length(archive_reason) between 3 and 500
  ),
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, sample_project_id)
);

alter table public.sample_project_preferences enable row level security;

drop policy if exists sample_project_preferences_owner_read
on public.sample_project_preferences;
create policy sample_project_preferences_owner_read
on public.sample_project_preferences for select to authenticated
using (profile_id = public.current_profile_id());

drop trigger if exists sample_project_preferences_set_updated_at
on public.sample_project_preferences;
create trigger sample_project_preferences_set_updated_at
before update on public.sample_project_preferences
for each row execute function public.set_updated_at();

create or replace function public.archive_sample_project(
  p_sample_project_id text,
  p_reason text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_result text;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  if p_sample_project_id not in (
    'study-streak',
    'meal-map',
    'voice-journal',
    'campus-lost-found',
    'accessible-reader',
    'realtime-study-room',
    'receipt-lens',
    'sensor-garden',
    'pocket-budget',
    'api-observatory',
    'subtitle-studio',
    'city-temperature-atlas'
  ) then
    raise exception 'sample project not found' using errcode = 'P0002';
  end if;

  if char_length(trim(coalesce(p_reason, ''))) not between 3 and 500 then
    raise exception 'archive reason is invalid' using errcode = '22023';
  end if;

  insert into public.sample_project_preferences (
    profile_id,
    sample_project_id,
    state,
    archive_reason,
    archived_at,
    deleted_at
  ) values (
    v_profile_id,
    p_sample_project_id,
    'archived',
    trim(p_reason),
    now(),
    null
  )
  on conflict (profile_id, sample_project_id) do update
  set state = 'archived',
      archive_reason = excluded.archive_reason,
      archived_at = excluded.archived_at,
      deleted_at = null
  where public.sample_project_preferences.state <> 'deleted'
  returning sample_project_id into v_result;

  if v_result is null then
    raise exception 'sample project not found' using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

create or replace function public.delete_sample_project(
  p_sample_project_id text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  if p_sample_project_id not in (
    'study-streak',
    'meal-map',
    'voice-journal',
    'campus-lost-found',
    'accessible-reader',
    'realtime-study-room',
    'receipt-lens',
    'sensor-garden',
    'pocket-budget',
    'api-observatory',
    'subtitle-studio',
    'city-temperature-atlas'
  ) then
    raise exception 'sample project not found' using errcode = 'P0002';
  end if;

  insert into public.sample_project_preferences (
    profile_id,
    sample_project_id,
    state,
    archive_reason,
    archived_at,
    deleted_at
  ) values (
    v_profile_id,
    p_sample_project_id,
    'deleted',
    null,
    null,
    now()
  )
  on conflict (profile_id, sample_project_id) do update
  set state = 'deleted',
      archive_reason = null,
      archived_at = null,
      deleted_at = excluded.deleted_at;

  return p_sample_project_id;
end;
$$;

revoke all on table public.sample_project_preferences from public, anon;
revoke insert, update, delete on table public.sample_project_preferences
from authenticated;
grant select on table public.sample_project_preferences to authenticated;

revoke all on function public.archive_sample_project(text, text)
from public, anon;
revoke all on function public.delete_sample_project(text)
from public, anon;
grant execute on function public.archive_sample_project(text, text)
to authenticated;
grant execute on function public.delete_sample_project(text)
to authenticated;

notify pgrst, 'reload schema';

commit;
