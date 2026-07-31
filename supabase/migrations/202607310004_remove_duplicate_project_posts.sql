-- Remove the eight accidental duplicate posts created while project reads
-- were unavailable. Abort the entire migration unless every target is still
-- published and belongs to the same owner as the project being retained.
do $$
declare
  v_owner_profile_id uuid;
  v_target_count integer;
  v_deleted_count integer;
begin
  select count(*) into v_target_count
  from public.projects
  where id = any(array[
    '38980cca-746c-4ba6-b3f9-3cf00cbb2865'::uuid,
    '64d012c3-59c5-44bc-b61b-f830b782f26f'::uuid,
    '9fb2f21a-d90c-4559-8c76-7c1b1cc67ef2'::uuid,
    'ab380650-4913-419f-b909-746d22e3e897'::uuid,
    'd0d0ff32-8f54-476c-8b21-5585399356d6'::uuid,
    'd40de8bc-a255-44c9-9ad3-86ab39370460'::uuid,
    'd4e5c07c-7139-4de3-9126-7677988ec276'::uuid,
    'fb88a0d8-6ba5-4cc6-a96b-a4d207d1588b'::uuid
  ]);

  -- Fresh databases and databases where cleanup already ran need no action.
  if v_target_count = 0 then
    return;
  end if;

  select owner_profile_id into v_owner_profile_id
  from public.projects
  where id = '39b88456-3e3d-4349-b2c8-0a46082027ad'::uuid
    and status = 'published';

  if v_owner_profile_id is null then
    raise exception 'retained project is not available';
  end if;

  select count(*) into v_target_count
  from public.projects
  where id = any(array[
    '38980cca-746c-4ba6-b3f9-3cf00cbb2865'::uuid,
    '64d012c3-59c5-44bc-b61b-f830b782f26f'::uuid,
    '9fb2f21a-d90c-4559-8c76-7c1b1cc67ef2'::uuid,
    'ab380650-4913-419f-b909-746d22e3e897'::uuid,
    'd0d0ff32-8f54-476c-8b21-5585399356d6'::uuid,
    'd40de8bc-a255-44c9-9ad3-86ab39370460'::uuid,
    'd4e5c07c-7139-4de3-9126-7677988ec276'::uuid,
    'fb88a0d8-6ba5-4cc6-a96b-a4d207d1588b'::uuid
  ])
    and owner_profile_id = v_owner_profile_id
    and status = 'published';

  if v_target_count <> 8 then
    raise exception 'expected 8 duplicate projects, found %', v_target_count;
  end if;

  delete from public.projects
  where id = any(array[
    '38980cca-746c-4ba6-b3f9-3cf00cbb2865'::uuid,
    '64d012c3-59c5-44bc-b61b-f830b782f26f'::uuid,
    '9fb2f21a-d90c-4559-8c76-7c1b1cc67ef2'::uuid,
    'ab380650-4913-419f-b909-746d22e3e897'::uuid,
    'd0d0ff32-8f54-476c-8b21-5585399356d6'::uuid,
    'd40de8bc-a255-44c9-9ad3-86ab39370460'::uuid,
    'd4e5c07c-7139-4de3-9126-7677988ec276'::uuid,
    'fb88a0d8-6ba5-4cc6-a96b-a4d207d1588b'::uuid
  ])
    and owner_profile_id = v_owner_profile_id
    and status = 'published';

  get diagnostics v_deleted_count = row_count;
  if v_deleted_count <> 8 then
    raise exception 'expected to delete 8 duplicate projects, deleted %',
      v_deleted_count;
  end if;
end;
$$;
