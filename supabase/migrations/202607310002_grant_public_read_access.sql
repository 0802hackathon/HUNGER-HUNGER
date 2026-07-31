-- RLS policies filter visible rows, but PostgreSQL privileges must allow the
-- SELECT operation before those policies can be evaluated. Keep all writes on
-- the validated server-side RPC paths by granting read access only.
grant select on table
  public.user_skills,
  public.projects,
  public.project_technologies,
  public.implemented_features,
  public.planned_features,
  public.project_explorations,
  public.progress_updates,
  public.learning_outcomes,
  public.project_continuations
to anon, authenticated;
