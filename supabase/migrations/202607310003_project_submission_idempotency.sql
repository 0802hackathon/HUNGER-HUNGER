-- Keep idempotency keys out of the publicly readable projects table. The
-- create_project security-definer function is the only access path.
create table public.project_submission_keys (
  owner_profile_id uuid not null
    references public.profiles(id) on delete cascade,
  submission_key uuid not null,
  project_id uuid unique
    references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_profile_id, submission_key)
);

alter table public.project_submission_keys enable row level security;
revoke all on table public.project_submission_keys from anon, authenticated;

create or replace function public.create_project(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_submission_key uuid;
  v_project_id uuid;
  v_claimed boolean := false;
  v_name text;
  v_index integer := 0;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required';
  end if;

  begin
    v_submission_key := nullif(trim(p_payload ->> 'submission_key'), '')::uuid;
  exception
    when invalid_text_representation then
      raise exception 'valid submission key required';
  end;
  if v_submission_key is null then
    raise exception 'valid submission key required';
  end if;

  if coalesce((p_payload ->> 'rights_confirmed')::boolean, false) is not true
     or coalesce((p_payload ->> 'secrets_confirmed')::boolean, false) is not true then
    raise exception 'rights and secret checks are required';
  end if;

  insert into public.project_submission_keys (
    owner_profile_id,
    submission_key
  ) values (
    v_profile_id,
    v_submission_key
  )
  on conflict (owner_profile_id, submission_key) do nothing
  returning true into v_claimed;

  if not coalesce(v_claimed, false) then
    select project_id into v_project_id
    from public.project_submission_keys
    where owner_profile_id = v_profile_id
      and submission_key = v_submission_key;

    if v_project_id is null then
      raise exception 'submission key is already being processed';
    end if;
    return v_project_id;
  end if;

  insert into public.projects (
    owner_profile_id,
    title,
    summary,
    motivation,
    abandonment_reason,
    current_state,
    known_limitations,
    repository_url,
    runtime_requirements,
    package_manager,
    install_command,
    lockfile_status,
    setup_instructions,
    dependency_notes,
    tested_environment,
    default_branch,
    last_tested_commit,
    status,
    difficulty,
    recommended_skill_level,
    license_identifier,
    usage_terms,
    rights_confirmed_at,
    secrets_confirmed_at,
    published_at
  ) values (
    v_profile_id,
    trim(p_payload ->> 'title'),
    trim(p_payload ->> 'summary'),
    trim(p_payload ->> 'motivation'),
    trim(p_payload ->> 'abandonment_reason'),
    trim(p_payload ->> 'current_state'),
    trim(p_payload ->> 'known_limitations'),
    trim(p_payload ->> 'repository_url'),
    trim(p_payload ->> 'runtime_requirements'),
    trim(p_payload ->> 'package_manager'),
    trim(p_payload ->> 'install_command'),
    trim(p_payload ->> 'lockfile_status'),
    trim(p_payload ->> 'setup_instructions'),
    trim(p_payload ->> 'dependency_notes'),
    trim(p_payload ->> 'tested_environment'),
    trim(p_payload ->> 'default_branch'),
    nullif(trim(p_payload ->> 'last_tested_commit'), ''),
    'published',
    (p_payload ->> 'difficulty')::public.difficulty_level,
    (p_payload ->> 'recommended_skill_level')::public.skill_level,
    trim(p_payload ->> 'license_identifier'),
    trim(p_payload ->> 'usage_terms'),
    now(),
    now(),
    now()
  )
  returning id into v_project_id;

  update public.project_submission_keys
  set project_id = v_project_id
  where owner_profile_id = v_profile_id
    and submission_key = v_submission_key;

  for v_name in
    select trim(value)
    from jsonb_array_elements_text(coalesce(p_payload -> 'technologies', '[]'))
  loop
    insert into public.project_technologies (
      project_id, name, is_used, is_learnable
    ) values (v_project_id, v_name, true, false)
    on conflict (project_id, name)
    do update set is_used = true;
  end loop;

  for v_name in
    select trim(value)
    from jsonb_array_elements_text(
      coalesce(p_payload -> 'learnable_technologies', '[]')
    )
  loop
    insert into public.project_technologies (
      project_id, name, is_used, is_learnable
    ) values (v_project_id, v_name, false, true)
    on conflict (project_id, name)
    do update set is_learnable = true;
  end loop;

  v_index := 0;
  for v_name in
    select trim(value)
    from jsonb_array_elements_text(
      coalesce(p_payload -> 'implemented_features', '[]')
    )
  loop
    insert into public.implemented_features (project_id, title, sort_order)
    values (v_project_id, v_name, v_index);
    v_index := v_index + 1;
  end loop;

  v_index := 0;
  for v_name in
    select trim(value)
    from jsonb_array_elements_text(
      coalesce(p_payload -> 'planned_features', '[]')
    )
  loop
    insert into public.planned_features (project_id, title, sort_order)
    values (v_project_id, v_name, v_index);
    v_index := v_index + 1;
  end loop;

  return v_project_id;
end;
$$;

revoke execute on function public.create_project(jsonb) from public;
grant execute on function public.create_project(jsonb) to authenticated;
