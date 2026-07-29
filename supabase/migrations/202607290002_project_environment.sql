-- Existing projects need reproducible environment metadata before learners
-- change dependencies in their own forks.
alter table public.projects
  add column if not exists runtime_requirements text not null
    default 'RepositoryのREADMEを確認してください'
    check (char_length(runtime_requirements) between 3 and 300),
  add column if not exists package_manager text not null
    default '未確認'
    check (char_length(package_manager) between 2 and 80),
  add column if not exists install_command text not null
    default 'RepositoryのREADMEを確認'
    check (char_length(install_command) between 2 and 300),
  add column if not exists lockfile_status text not null
    default 'unknown'
    check (
      lockfile_status in ('committed', 'missing', 'not_applicable', 'unknown')
    ),
  add column if not exists setup_instructions text not null
    default 'RepositoryのREADMEを確認し、元の開発環境を再現してください。'
    check (char_length(setup_instructions) between 20 and 3000),
  add column if not exists dependency_notes text not null
    default '既存のLockfileとREADMEを確認してから依存関係を更新してください。'
    check (char_length(dependency_notes) between 10 and 3000),
  add column if not exists tested_environment text not null
    default '未確認'
    check (char_length(tested_environment) between 3 and 500),
  add column if not exists default_branch text not null
    default 'main'
    check (default_branch ~ '^[A-Za-z0-9._/-]+$'),
  add column if not exists last_tested_commit text
    check (
      last_tested_commit is null
      or last_tested_commit ~ '^[0-9a-fA-F]{7,64}$'
    );

create or replace function public.create_project(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_project_id uuid;
  v_name text;
  v_index integer := 0;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required';
  end if;
  if coalesce((p_payload ->> 'rights_confirmed')::boolean, false) is not true
     or coalesce((p_payload ->> 'secrets_confirmed')::boolean, false) is not true then
    raise exception 'rights and secret checks are required';
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

grant execute on function public.create_project(jsonb) to authenticated;
