-- Limit legacy journal data and the legacy gallery bucket to the two members.

revoke all on table public.admin_profiles from public, anon;
revoke all on table public.memories from public, anon;
revoke all on table public.gallery_images from public, anon;
revoke all on table public.stories from public, anon;
revoke all on table public.notes from public, anon;
revoke all on table public.diary_entries from public, anon;
revoke all on table public.site_settings from public, anon;

grant select on table public.admin_profiles to authenticated;
grant select on table public.memories to authenticated;
grant select on table public.gallery_images to authenticated;
grant select on table public.stories to authenticated;
grant select on table public.notes to authenticated;
grant select on table public.diary_entries to authenticated;
grant select on table public.site_settings to authenticated;

drop policy if exists "authed_read_admin_profiles" on public.admin_profiles;
drop policy if exists "admin_insert_admin_profile" on public.admin_profiles;
drop policy if exists couple_read_admin_profiles on public.admin_profiles;
create policy couple_read_admin_profiles on public.admin_profiles
  for select to authenticated using (public.is_couple_member());

drop policy if exists admin_insert_memories on public.memories;
drop policy if exists admin_update_memories on public.memories;
drop policy if exists admin_delete_memories on public.memories;
drop policy if exists couple_read_memories on public.memories;
drop policy if exists couple_insert_memories on public.memories;
drop policy if exists couple_update_memories on public.memories;
drop policy if exists couple_delete_memories on public.memories;
create policy couple_read_memories on public.memories
  for select to authenticated using (public.is_couple_member());
create policy couple_insert_memories on public.memories
  for insert to authenticated with check (public.is_couple_member());
create policy couple_update_memories on public.memories
  for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy couple_delete_memories on public.memories
  for delete to authenticated using (public.is_couple_member());

drop policy if exists admin_insert_gallery on public.gallery_images;
drop policy if exists admin_update_gallery on public.gallery_images;
drop policy if exists admin_delete_gallery on public.gallery_images;
drop policy if exists couple_read_gallery on public.gallery_images;
drop policy if exists couple_insert_gallery on public.gallery_images;
drop policy if exists couple_update_gallery on public.gallery_images;
drop policy if exists couple_delete_gallery on public.gallery_images;
create policy couple_read_gallery on public.gallery_images
  for select to authenticated using (public.is_couple_member());
create policy couple_insert_gallery on public.gallery_images
  for insert to authenticated with check (public.is_couple_member());
create policy couple_update_gallery on public.gallery_images
  for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy couple_delete_gallery on public.gallery_images
  for delete to authenticated using (public.is_couple_member());

drop policy if exists admin_insert_stories on public.stories;
drop policy if exists admin_update_stories on public.stories;
drop policy if exists admin_delete_stories on public.stories;
drop policy if exists couple_read_stories on public.stories;
drop policy if exists couple_insert_stories on public.stories;
drop policy if exists couple_update_stories on public.stories;
drop policy if exists couple_delete_stories on public.stories;
create policy couple_read_stories on public.stories
  for select to authenticated using (public.is_couple_member());
create policy couple_insert_stories on public.stories
  for insert to authenticated with check (public.is_couple_member());
create policy couple_update_stories on public.stories
  for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy couple_delete_stories on public.stories
  for delete to authenticated using (public.is_couple_member());

drop policy if exists admin_insert_notes on public.notes;
drop policy if exists admin_update_notes on public.notes;
drop policy if exists admin_delete_notes on public.notes;
drop policy if exists couple_read_notes on public.notes;
drop policy if exists couple_insert_notes on public.notes;
drop policy if exists couple_update_notes on public.notes;
drop policy if exists couple_delete_notes on public.notes;
create policy couple_read_notes on public.notes
  for select to authenticated using (public.is_couple_member());
create policy couple_insert_notes on public.notes
  for insert to authenticated with check (public.is_couple_member());
create policy couple_update_notes on public.notes
  for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy couple_delete_notes on public.notes
  for delete to authenticated using (public.is_couple_member());

drop policy if exists admin_insert_diary on public.diary_entries;
drop policy if exists admin_update_diary on public.diary_entries;
drop policy if exists admin_delete_diary on public.diary_entries;
drop policy if exists couple_read_diary on public.diary_entries;
drop policy if exists couple_insert_diary on public.diary_entries;
drop policy if exists couple_update_diary on public.diary_entries;
drop policy if exists couple_delete_diary on public.diary_entries;
create policy couple_read_diary on public.diary_entries
  for select to authenticated using (public.is_couple_member());
create policy couple_insert_diary on public.diary_entries
  for insert to authenticated with check (public.is_couple_member());
create policy couple_update_diary on public.diary_entries
  for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
create policy couple_delete_diary on public.diary_entries
  for delete to authenticated using (public.is_couple_member());

drop policy if exists admin_upsert_settings on public.site_settings;
drop policy if exists admin_update_settings on public.site_settings;
drop policy if exists couple_read_settings on public.site_settings;
drop policy if exists couple_insert_settings on public.site_settings;
drop policy if exists couple_update_settings on public.site_settings;
create policy couple_read_settings on public.site_settings
  for select to authenticated using (public.is_couple_member());
create policy couple_insert_settings on public.site_settings
  for insert to authenticated with check (public.is_couple_member());
create policy couple_update_settings on public.site_settings
  for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());

update storage.buckets
set public = false
where id = 'gallery';

drop policy if exists "public_read_gallery_bucket" on storage.objects;
drop policy if exists "admin_insert_gallery_bucket" on storage.objects;
drop policy if exists "admin_update_gallery_bucket" on storage.objects;
drop policy if exists "admin_delete_gallery_bucket" on storage.objects;
drop policy if exists couple_read_legacy_gallery_objects on storage.objects;
drop policy if exists couple_insert_legacy_gallery_objects on storage.objects;
drop policy if exists couple_update_legacy_gallery_objects on storage.objects;
drop policy if exists couple_delete_legacy_gallery_objects on storage.objects;

create policy couple_read_legacy_gallery_objects on storage.objects
  for select to authenticated
  using (bucket_id = 'gallery' and public.is_couple_member());
create policy couple_insert_legacy_gallery_objects on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_couple_member());
create policy couple_update_legacy_gallery_objects on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_couple_member())
  with check (bucket_id = 'gallery' and public.is_couple_member());
create policy couple_delete_legacy_gallery_objects on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_couple_member());
