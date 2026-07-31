-- Auth users created before the profile trigger was installed do not have an
-- owner profile and therefore cannot publish projects. Backfill only missing
-- profiles; soft-deleted profiles remain untouched by the unique constraint.
insert into public.profiles (auth_user_id, display_name)
select
  auth_user.id,
  left(
    case
      when char_length(trim(coalesce(
        nullif(auth_user.raw_user_meta_data ->> 'display_name', ''),
        nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
        nullif(auth_user.raw_user_meta_data ->> 'name', ''),
        nullif(auth_user.raw_user_meta_data ->> 'user_name', ''),
        split_part(coalesce(auth_user.email, 'hunter'), '@', 1)
      ))) < 2 then 'hunter'
      else trim(coalesce(
        nullif(auth_user.raw_user_meta_data ->> 'display_name', ''),
        nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
        nullif(auth_user.raw_user_meta_data ->> 'name', ''),
        nullif(auth_user.raw_user_meta_data ->> 'user_name', ''),
        split_part(coalesce(auth_user.email, 'hunter'), '@', 1)
      ))
    end,
    50
  )
from auth.users as auth_user
where not exists (
  select 1
  from public.profiles as profile
  where profile.auth_user_id = auth_user.id
)
on conflict (auth_user_id) do nothing;
