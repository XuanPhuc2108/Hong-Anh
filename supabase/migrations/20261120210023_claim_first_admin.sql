create function public.claim_first_admin(
  p_user_id uuid,
  p_display_name text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('public.admin_profiles.claim_first_admin', 0)
  );

  if exists (select 1 from public.admin_profiles) then
    return false;
  end if;

  insert into public.admin_profiles (user_id, display_name)
  values (p_user_id, p_display_name);

  return true;
end;
$$;

revoke all on function public.claim_first_admin(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_first_admin(uuid, text) to service_role;
