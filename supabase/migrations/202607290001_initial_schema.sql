create extension if not exists pgcrypto;

create type public.project_status as enum (
  'draft',
  'published',
  'completed',
  'archived'
);
create type public.difficulty_level as enum (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);
create type public.skill_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);
create type public.skill_kind as enum (
  'learning',
  'experienced'
);
create type public.exploration_status as enum (
  'active',
  'paused',
  'completed'
);
create type public.continuation_status as enum (
  'draft',
  'published',
  'archived'
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  display_name text not null check (char_length(display_name) between 2 and 50),
  bio text check (bio is null or char_length(bio) <= 500),
  github_url text check (
    github_url is null or github_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/?$'
  ),
  avatar_path text,
  experience_summary text check (
    experience_summary is null or char_length(experience_summary) <= 1000
  ),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  kind public.skill_kind not null,
  level public.skill_level not null,
  years_experience numeric(4, 1) check (
    years_experience is null or years_experience between 0 and 80
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, name, kind)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 80),
  summary text not null check (char_length(summary) between 20 and 240),
  motivation text not null check (char_length(motivation) between 20 and 2000),
  abandonment_reason text not null check (
    char_length(abandonment_reason) between 20 and 2000
  ),
  current_state text not null check (
    char_length(current_state) between 20 and 3000
  ),
  known_limitations text not null check (
    char_length(known_limitations) between 10 and 3000
  ),
  repository_url text not null check (
    repository_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$'
  ),
  runtime_requirements text not null check (
    char_length(runtime_requirements) between 3 and 300
  ),
  package_manager text not null check (
    char_length(package_manager) between 2 and 80
  ),
  install_command text not null check (
    char_length(install_command) between 2 and 300
  ),
  lockfile_status text not null check (
    lockfile_status in ('committed', 'missing', 'not_applicable', 'unknown')
  ),
  setup_instructions text not null check (
    char_length(setup_instructions) between 20 and 3000
  ),
  dependency_notes text not null check (
    char_length(dependency_notes) between 10 and 3000
  ),
  tested_environment text not null check (
    char_length(tested_environment) between 3 and 500
  ),
  default_branch text not null default 'main' check (
    default_branch ~ '^[A-Za-z0-9._/-]+$'
  ),
  last_tested_commit text check (
    last_tested_commit is null
    or last_tested_commit ~ '^[0-9a-fA-F]{7,64}$'
  ),
  status public.project_status not null default 'draft',
  difficulty public.difficulty_level not null,
  recommended_skill_level public.skill_level not null,
  license_identifier text not null check (
    char_length(license_identifier) between 2 and 80
  ),
  usage_terms text not null check (char_length(usage_terms) between 20 and 2000),
  terms_version integer not null default 1 check (terms_version >= 1),
  rights_confirmed_at timestamptz not null,
  secrets_confirmed_at timestamptz not null,
  cover_path text,
  beyond_count integer not null default 0 check (beyond_count >= 0),
  continuation_count integer not null default 0 check (continuation_count >= 0),
  published_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  archive_reason text check (
    archive_reason is null or char_length(archive_reason) <= 500
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  is_used boolean not null default false,
  is_learnable boolean not null default false,
  created_at timestamptz not null default now(),
  check (is_used or is_learnable),
  unique (project_id, name)
);

create table public.implemented_features (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.planned_features (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_explorations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  learner_profile_id uuid not null references public.profiles(id) on delete restrict,
  status public.exploration_status not null default 'active',
  fork_url text check (fork_url is null or fork_url ~ '^https://github\.com/'),
  is_public boolean not null default true,
  accepted_terms_version integer not null,
  accepted_license_identifier text not null,
  accepted_usage_terms text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (project_id, learner_profile_id)
);

create table public.progress_updates (
  id uuid primary key default gen_random_uuid(),
  exploration_id uuid not null references public.project_explorations(id) on delete restrict,
  author_profile_id uuid not null references public.profiles(id) on delete restrict,
  summary text not null check (char_length(summary) between 3 and 2000),
  blockers text check (blockers is null or char_length(blockers) <= 2000),
  progress_percent integer check (
    progress_percent is null or progress_percent between 0 and 100
  ),
  branch_url text check (branch_url is null or branch_url ~ '^https://'),
  commit_url text check (commit_url is null or commit_url ~ '^https://'),
  pull_request_url text check (
    pull_request_url is null or pull_request_url ~ '^https://'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_outcomes (
  id uuid primary key default gen_random_uuid(),
  exploration_id uuid not null references public.project_explorations(id) on delete restrict,
  author_profile_id uuid not null references public.profiles(id) on delete restrict,
  summary text not null check (char_length(summary) between 10 and 3000),
  learned text not null check (char_length(learned) between 10 and 3000),
  difficulties text check (
    difficulties is null or char_length(difficulties) <= 3000
  ),
  next_steps text check (next_steps is null or char_length(next_steps) <= 3000),
  evidence_url text check (evidence_url is null or evidence_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_continuations (
  id uuid primary key default gen_random_uuid(),
  source_project_id uuid not null references public.projects(id) on delete restrict,
  author_profile_id uuid not null references public.profiles(id) on delete restrict,
  exploration_id uuid references public.project_explorations(id) on delete set null,
  title text not null check (char_length(title) between 3 and 100),
  summary text not null check (char_length(summary) between 20 and 300),
  changes_made text not null check (char_length(changes_made) between 20 and 3000),
  repository_url text not null check (repository_url ~ '^https://'),
  demo_url text check (demo_url is null or demo_url ~ '^https://'),
  pull_request_url text check (
    pull_request_url is null or pull_request_url ~ '^https://'
  ),
  learning_outcome text check (
    learning_outcome is null or char_length(learning_outcome) <= 3000
  ),
  license_identifier text not null check (
    char_length(license_identifier) between 2 and 80
  ),
  source_terms_version integer not null,
  source_license_identifier text not null,
  source_usage_terms text not null,
  rights_confirmed_at timestamptz not null,
  secrets_confirmed_at timestamptz not null,
  status public.continuation_status not null default 'published',
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_public_list_idx
  on public.projects (status, updated_at desc);
create index projects_owner_idx
  on public.projects (owner_profile_id, updated_at desc);
create index projects_difficulty_idx
  on public.projects (difficulty, status);
create index project_technologies_used_idx
  on public.project_technologies (name, project_id)
  where is_used;
create index project_technologies_learnable_idx
  on public.project_technologies (name, project_id)
  where is_learnable;
create index implemented_features_project_idx
  on public.implemented_features (project_id, sort_order);
create index planned_features_project_idx
  on public.planned_features (project_id, sort_order);
create index explorations_learner_idx
  on public.project_explorations (learner_profile_id, status, updated_at desc);
create index progress_exploration_idx
  on public.progress_updates (exploration_id, created_at desc);
create index continuations_project_idx
  on public.project_continuations (source_project_id, status, published_at desc);
create index continuations_author_idx
  on public.project_continuations (author_profile_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger user_skills_set_updated_at
before update on public.user_skills
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();
create trigger implemented_features_set_updated_at
before update on public.implemented_features
for each row execute function public.set_updated_at();
create trigger planned_features_set_updated_at
before update on public.planned_features
for each row execute function public.set_updated_at();
create trigger explorations_set_updated_at
before update on public.project_explorations
for each row execute function public.set_updated_at();
create trigger progress_updates_set_updated_at
before update on public.progress_updates
for each row execute function public.set_updated_at();
create trigger learning_outcomes_set_updated_at
before update on public.learning_outcomes
for each row execute function public.set_updated_at();
create trigger continuations_set_updated_at
before update on public.project_continuations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (auth_user_id, display_name)
  values (
    new.id,
    left(
      case
        when char_length(trim(coalesce(
          nullif(new.raw_user_meta_data ->> 'display_name', ''),
          nullif(new.raw_user_meta_data ->> 'full_name', ''),
          nullif(new.raw_user_meta_data ->> 'name', ''),
          nullif(new.raw_user_meta_data ->> 'user_name', ''),
          split_part(coalesce(new.email, 'hunter'), '@', 1)
        ))) < 2 then 'hunter'
        else trim(coalesce(
          nullif(new.raw_user_meta_data ->> 'display_name', ''),
          nullif(new.raw_user_meta_data ->> 'full_name', ''),
          nullif(new.raw_user_meta_data ->> 'name', ''),
          nullif(new.raw_user_meta_data ->> 'user_name', ''),
          split_part(coalesce(new.email, 'hunter'), '@', 1)
        ))
      end,
      50
    )
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
    and deleted_at is null
  limit 1;
$$;

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

create or replace function public.start_project_exploration(p_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_project public.projects%rowtype;
  v_exploration_id uuid;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required';
  end if;

  select * into v_project
  from public.projects
  where id = p_project_id
  for update;

  if v_project.id is null or v_project.status <> 'published' then
    raise exception 'project is not available';
  end if;
  if v_project.owner_profile_id = v_profile_id then
    raise exception 'owners cannot beyond their own project';
  end if;

  select id into v_exploration_id
  from public.project_explorations
  where project_id = p_project_id
    and learner_profile_id = v_profile_id;

  if v_exploration_id is not null then
    update public.project_explorations
    set status = 'active',
        accepted_terms_version = v_project.terms_version,
        accepted_license_identifier = v_project.license_identifier,
        accepted_usage_terms = v_project.usage_terms
    where id = v_exploration_id;
    return v_exploration_id;
  end if;

  insert into public.project_explorations (
    project_id,
    learner_profile_id,
    accepted_terms_version,
    accepted_license_identifier,
    accepted_usage_terms
  ) values (
    p_project_id,
    v_profile_id,
    v_project.terms_version,
    v_project.license_identifier,
    v_project.usage_terms
  )
  returning id into v_exploration_id;

  update public.projects
  set beyond_count = beyond_count + 1
  where id = p_project_id;

  return v_exploration_id;
end;
$$;

create or replace function public.publish_project_continuation(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_project public.projects%rowtype;
  v_exploration_id uuid;
  v_continuation_id uuid;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required';
  end if;
  if coalesce((p_payload ->> 'rights_confirmed')::boolean, false) is not true
     or coalesce((p_payload ->> 'secrets_confirmed')::boolean, false) is not true then
    raise exception 'rights and secret checks are required';
  end if;

  select * into v_project
  from public.projects
  where id = (p_payload ->> 'source_project_id')::uuid
  for update;

  if v_project.id is null or v_project.status <> 'published' then
    raise exception 'project is not available';
  end if;
  if v_project.owner_profile_id = v_profile_id then
    raise exception 'owners cannot shoot their own project';
  end if;

  select id into v_exploration_id
  from public.project_explorations
  where project_id = v_project.id
    and learner_profile_id = v_profile_id;

  if v_exploration_id is null then
    insert into public.project_explorations (
      project_id,
      learner_profile_id,
      accepted_terms_version,
      accepted_license_identifier,
      accepted_usage_terms
    ) values (
      v_project.id,
      v_profile_id,
      v_project.terms_version,
      v_project.license_identifier,
      v_project.usage_terms
    )
    returning id into v_exploration_id;

    update public.projects
    set beyond_count = beyond_count + 1
    where id = v_project.id;
  end if;

  insert into public.project_continuations (
    source_project_id,
    author_profile_id,
    exploration_id,
    title,
    summary,
    changes_made,
    repository_url,
    demo_url,
    pull_request_url,
    learning_outcome,
    license_identifier,
    source_terms_version,
    source_license_identifier,
    source_usage_terms,
    rights_confirmed_at,
    secrets_confirmed_at,
    status,
    published_at
  ) values (
    v_project.id,
    v_profile_id,
    v_exploration_id,
    trim(p_payload ->> 'title'),
    trim(p_payload ->> 'summary'),
    trim(p_payload ->> 'changes_made'),
    trim(p_payload ->> 'repository_url'),
    nullif(trim(p_payload ->> 'demo_url'), ''),
    nullif(trim(p_payload ->> 'pull_request_url'), ''),
    nullif(trim(p_payload ->> 'learning_outcome'), ''),
    trim(p_payload ->> 'license_identifier'),
    v_project.terms_version,
    v_project.license_identifier,
    v_project.usage_terms,
    now(),
    now(),
    'published',
    now()
  )
  returning id into v_continuation_id;

  update public.projects
  set continuation_count = continuation_count + 1
  where id = v_project.id;

  return v_continuation_id;
end;
$$;

create or replace function public.record_progress_update(
  p_exploration_id uuid,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_exploration public.project_explorations%rowtype;
  v_project_status public.project_status;
  v_progress_id uuid;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required';
  end if;

  select * into v_exploration
  from public.project_explorations
  where id = p_exploration_id
  for update;

  select status into v_project_status
  from public.projects
  where id = v_exploration.project_id;

  if v_exploration.id is null
     or v_exploration.learner_profile_id <> v_profile_id
     or v_exploration.status <> 'active'
     or v_project_status <> 'published' then
    raise exception 'exploration is not editable';
  end if;

  insert into public.progress_updates (
    exploration_id,
    author_profile_id,
    summary,
    blockers,
    progress_percent,
    branch_url,
    commit_url,
    pull_request_url
  ) values (
    p_exploration_id,
    v_profile_id,
    trim(p_payload ->> 'summary'),
    nullif(trim(p_payload ->> 'blockers'), ''),
    (p_payload ->> 'progress_percent')::integer,
    nullif(trim(p_payload ->> 'branch_url'), ''),
    nullif(trim(p_payload ->> 'commit_url'), ''),
    nullif(trim(p_payload ->> 'pull_request_url'), '')
  )
  returning id into v_progress_id;

  if nullif(trim(p_payload ->> 'learned'), '') is not null then
    insert into public.learning_outcomes (
      exploration_id,
      author_profile_id,
      summary,
      learned,
      next_steps
    ) values (
      p_exploration_id,
      v_profile_id,
      left('進捗更新で得た学び: ' || trim(p_payload ->> 'summary'), 3000),
      trim(p_payload ->> 'learned'),
      nullif(trim(p_payload ->> 'next_steps'), '')
    );
  end if;

  return v_progress_id;
end;
$$;

create or replace function public.update_my_profile(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_name text;
begin
  if v_profile_id is null then
    raise exception 'authenticated profile required';
  end if;

  update public.profiles
  set display_name = trim(p_payload ->> 'display_name'),
      bio = nullif(trim(p_payload ->> 'bio'), ''),
      github_url = nullif(trim(p_payload ->> 'github_url'), ''),
      experience_summary = nullif(trim(p_payload ->> 'experience_summary'), '')
  where id = v_profile_id;

  delete from public.user_skills
  where profile_id = v_profile_id;

  for v_name in
    select distinct trim(value)
    from jsonb_array_elements_text(
      coalesce(p_payload -> 'learning_skills', '[]')
    )
    where trim(value) <> ''
  loop
    insert into public.user_skills (profile_id, name, kind, level)
    values (v_profile_id, v_name, 'learning', 'beginner');
  end loop;

  for v_name in
    select distinct trim(value)
    from jsonb_array_elements_text(
      coalesce(p_payload -> 'experienced_skills', '[]')
    )
    where trim(value) <> ''
  loop
    insert into public.user_skills (profile_id, name, kind, level)
    values (v_profile_id, v_name, 'experienced', 'intermediate');
  end loop;

  return v_profile_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_technologies enable row level security;
alter table public.implemented_features enable row level security;
alter table public.planned_features enable row level security;
alter table public.project_explorations enable row level security;
alter table public.progress_updates enable row level security;
alter table public.learning_outcomes enable row level security;
alter table public.project_continuations enable row level security;

create policy profiles_public_read
on public.profiles for select
using (deleted_at is null);

create policy profiles_self_update
on public.profiles for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy user_skills_public_read
on public.user_skills for select
using (true);
create policy user_skills_self_insert
on public.user_skills for insert to authenticated
with check (profile_id = public.current_profile_id());
create policy user_skills_self_update
on public.user_skills for update to authenticated
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());
create policy user_skills_self_delete
on public.user_skills for delete to authenticated
using (profile_id = public.current_profile_id());

create policy projects_public_read
on public.projects for select
using (
  status in ('published', 'completed', 'archived')
  or owner_profile_id = public.current_profile_id()
);
create policy projects_owner_insert
on public.projects for insert to authenticated
with check (owner_profile_id = public.current_profile_id());
create policy projects_owner_update
on public.projects for update to authenticated
using (owner_profile_id = public.current_profile_id())
with check (owner_profile_id = public.current_profile_id());

create policy project_technologies_read
on public.project_technologies for select
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and (
        p.status in ('published', 'completed', 'archived')
        or p.owner_profile_id = public.current_profile_id()
      )
  )
);
create policy project_technologies_owner_write
on public.project_technologies for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
);

create policy implemented_features_read
on public.implemented_features for select
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and (
        p.status in ('published', 'completed', 'archived')
        or p.owner_profile_id = public.current_profile_id()
      )
  )
);
create policy implemented_features_owner_write
on public.implemented_features for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
);

create policy planned_features_read
on public.planned_features for select
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and (
        p.status in ('published', 'completed', 'archived')
        or p.owner_profile_id = public.current_profile_id()
      )
  )
);
create policy planned_features_owner_write
on public.planned_features for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
);

create policy explorations_visible_read
on public.project_explorations for select
using (
  learner_profile_id = public.current_profile_id()
  or is_public
  or exists (
    select 1 from public.projects p
    where p.id = project_id
      and p.owner_profile_id = public.current_profile_id()
  )
);
create policy explorations_self_update
on public.project_explorations for update to authenticated
using (learner_profile_id = public.current_profile_id())
with check (learner_profile_id = public.current_profile_id());

create policy progress_visible_read
on public.progress_updates for select
using (
  author_profile_id = public.current_profile_id()
  or exists (
    select 1 from public.project_explorations e
    join public.projects p on p.id = e.project_id
    where e.id = exploration_id
      and (e.is_public or p.owner_profile_id = public.current_profile_id())
  )
);
create policy progress_self_insert
on public.progress_updates for insert to authenticated
with check (
  author_profile_id = public.current_profile_id()
  and exists (
    select 1 from public.project_explorations e
    join public.projects p on p.id = e.project_id
    where e.id = exploration_id
      and e.learner_profile_id = public.current_profile_id()
      and e.status = 'active'
      and p.status = 'published'
  )
);
create policy progress_self_update
on public.progress_updates for update to authenticated
using (author_profile_id = public.current_profile_id())
with check (author_profile_id = public.current_profile_id());

create policy outcomes_visible_read
on public.learning_outcomes for select
using (
  author_profile_id = public.current_profile_id()
  or exists (
    select 1 from public.project_explorations e
    join public.projects p on p.id = e.project_id
    where e.id = exploration_id
      and (e.is_public or p.owner_profile_id = public.current_profile_id())
  )
);
create policy outcomes_self_insert
on public.learning_outcomes for insert to authenticated
with check (
  author_profile_id = public.current_profile_id()
  and exists (
    select 1 from public.project_explorations e
    where e.id = exploration_id
      and e.learner_profile_id = public.current_profile_id()
  )
);
create policy outcomes_self_update
on public.learning_outcomes for update to authenticated
using (author_profile_id = public.current_profile_id())
with check (author_profile_id = public.current_profile_id());

create policy continuations_public_read
on public.project_continuations for select
using (
  status = 'published'
  or author_profile_id = public.current_profile_id()
);
create policy continuations_self_update
on public.project_continuations for update to authenticated
using (author_profile_id = public.current_profile_id())
with check (author_profile_id = public.current_profile_id());

grant execute on function public.create_project(jsonb) to authenticated;
grant execute on function public.start_project_exploration(uuid) to authenticated;
grant execute on function public.publish_project_continuation(jsonb) to authenticated;
grant execute on function public.record_progress_update(uuid, jsonb) to authenticated;
grant execute on function public.update_my_profile(jsonb) to authenticated;
grant execute on function public.current_profile_id() to authenticated;

revoke select on public.profiles from anon, authenticated;
grant select (
  id,
  display_name,
  bio,
  github_url,
  avatar_path,
  experience_summary,
  deleted_at,
  created_at,
  updated_at
) on public.profiles to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-covers',
  'project-covers',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy avatars_public_read
on storage.objects for select
using (bucket_id = 'avatars');
create policy avatars_owner_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.current_profile_id()::text
);
create policy avatars_owner_update
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.current_profile_id()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.current_profile_id()::text
);
create policy avatars_owner_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = public.current_profile_id()::text
);

create policy project_covers_public_read
on storage.objects for select
using (bucket_id = 'project-covers');
create policy project_covers_owner_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'project-covers'
  and exists (
    select 1
    from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_profile_id = public.current_profile_id()
  )
);
create policy project_covers_owner_update
on storage.objects for update to authenticated
using (
  bucket_id = 'project-covers'
  and exists (
    select 1
    from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_profile_id = public.current_profile_id()
  )
)
with check (
  bucket_id = 'project-covers'
  and exists (
    select 1
    from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_profile_id = public.current_profile_id()
  )
);
create policy project_covers_owner_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'project-covers'
  and exists (
    select 1
    from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_profile_id = public.current_profile_id()
  )
);
