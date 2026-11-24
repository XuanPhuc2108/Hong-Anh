-- Private two-person journal access and shared photos/letters.
-- The existing public `gallery` bucket and its contents remain unchanged.

create table if not exists public.couple_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null unique check (display_name in ('Phúc', 'Ánh')),
  created_at timestamptz not null default now()
);

alter table public.couple_members enable row level security;
revoke all on table public.couple_members from public, anon, authenticated;
grant select on table public.couple_members to authenticated;

drop policy if exists couple_members_read_self on public.couple_members;
create policy couple_members_read_self on public.couple_members
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_couple_member()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.couple_members
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_couple_member() from public, anon;
grant execute on function public.is_couple_member() to authenticated;

create or replace function public.get_couple_identity()
returns table (
  user_id uuid,
  display_name text,
  partner_id uuid,
  partner_name text
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select member.user_id, member.display_name, partner.user_id, partner.display_name
  from public.couple_members as member
  left join public.couple_members as partner on partner.user_id <> member.user_id
  where member.user_id = auth.uid();
$$;

revoke all on function public.get_couple_identity() from public, anon;
grant execute on function public.get_couple_identity() to authenticated;

create table if not exists public.couple_gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id text not null check (album_id in ('together', 'phuc', 'anh')),
  storage_path text not null unique,
  caption text not null default '' check (char_length(caption) <= 240),
  photo_date date,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  note text not null default '' check (char_length(note) <= 800),
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text not null check (mime_type like 'image/%'),
  file_size bigint not null check (file_size between 1 and 52428800),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_path ~ ('^photos/' || album_id || '/' || uploader_id::text || '/[0-9a-f-]+\.[a-z0-9]{1,8}$'))
);

create index if not exists idx_couple_gallery_album_created
  on public.couple_gallery_images(album_id, created_at desc);
create unique index if not exists idx_couple_gallery_one_cover
  on public.couple_gallery_images(album_id) where is_cover;

alter table public.couple_gallery_images enable row level security;
revoke all on table public.couple_gallery_images from public, anon, authenticated;
grant select, insert on table public.couple_gallery_images to authenticated;

drop policy if exists couple_gallery_read_members on public.couple_gallery_images;
create policy couple_gallery_read_members on public.couple_gallery_images
  for select to authenticated
  using (public.is_couple_member());

drop policy if exists couple_gallery_insert_owner on public.couple_gallery_images;
create policy couple_gallery_insert_owner on public.couple_gallery_images
  for insert to authenticated
  with check (
    public.is_couple_member()
    and uploader_id = auth.uid()
    and not is_cover
  );

create or replace function public.touch_couple_gallery_image()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_couple_gallery_image() from public, anon, authenticated;
drop trigger if exists touch_couple_gallery_image_updated_at on public.couple_gallery_images;
create trigger touch_couple_gallery_image_updated_at
  before update on public.couple_gallery_images
  for each row execute function public.touch_couple_gallery_image();

create or replace function public.set_couple_gallery_cover(
  p_album_id text,
  p_image_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_couple_member() then
    raise exception 'Only couple members can change album covers.';
  end if;

  if p_album_id not in ('together', 'phuc', 'anh')
    or not exists (
      select 1
      from public.couple_gallery_images
      where id = p_image_id and album_id = p_album_id
    )
  then
    raise exception 'The selected cover does not belong to this album.';
  end if;

  update public.couple_gallery_images
  set is_cover = false
  where album_id = p_album_id and is_cover;

  update public.couple_gallery_images
  set is_cover = true
  where id = p_image_id;
end;
$$;

revoke all on function public.set_couple_gallery_cover(text, uuid) from public, anon;
grant execute on function public.set_couple_gallery_cover(text, uuid) to authenticated;

create or replace function public.update_couple_gallery_image(
  p_image_id uuid,
  p_album_id text,
  p_caption text,
  p_photo_date date,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  old_album_id text;
  was_cover boolean;
  replacement_id uuid;
begin
  if not public.is_couple_member() then
    raise exception 'Only couple members can update shared photos.';
  end if;
  if p_album_id not in ('together', 'phuc', 'anh') then
    raise exception 'The selected album is invalid.';
  end if;

  select album_id, is_cover
  into old_album_id, was_cover
  from public.couple_gallery_images
  where id = p_image_id and uploader_id = auth.uid()
  for update;

  if not found then
    raise exception 'The photo is unavailable or you cannot edit it.';
  end if;

  if old_album_id <> p_album_id and was_cover then
    select id into replacement_id
    from public.couple_gallery_images
    where album_id = old_album_id and id <> p_image_id
    order by created_at desc
    limit 1;

    update public.couple_gallery_images
    set is_cover = false
    where id = p_image_id;

    if replacement_id is not null then
      update public.couple_gallery_images
      set is_cover = true
      where id = replacement_id;
    end if;
  end if;

  update public.couple_gallery_images
  set album_id = p_album_id,
      caption = p_caption,
      photo_date = p_photo_date,
      note = p_note,
      is_cover = case when old_album_id <> p_album_id then false else is_cover end
  where id = p_image_id;

  if old_album_id <> p_album_id and was_cover then
    update public.couple_gallery_images
    set is_cover = false
    where album_id = p_album_id and is_cover;

    update public.couple_gallery_images
    set is_cover = true
    where id = p_image_id;
  end if;
end;
$$;

revoke all on function public.update_couple_gallery_image(uuid, text, text, date, text) from public, anon;
grant execute on function public.update_couple_gallery_image(uuid, text, text, date, text) to authenticated;

create or replace function public.delete_couple_gallery_image(p_image_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  image_row public.couple_gallery_images%rowtype;
  replacement_id uuid;
begin
  if not public.is_couple_member() then
    raise exception 'Only couple members can delete shared photos.';
  end if;

  select * into image_row
  from public.couple_gallery_images
  where id = p_image_id and uploader_id = auth.uid()
  for update;

  if not found then
    raise exception 'The photo is unavailable or you cannot delete it.';
  end if;

  if image_row.is_cover then
    select id into replacement_id
    from public.couple_gallery_images
    where album_id = image_row.album_id and id <> p_image_id
    order by created_at desc
    limit 1;

    update public.couple_gallery_images
    set is_cover = false
    where id = p_image_id;

    if replacement_id is not null then
      update public.couple_gallery_images
      set is_cover = true
      where id = replacement_id;
    end if;
  end if;

  delete from public.couple_gallery_images where id = p_image_id;
  return image_row.storage_path;
end;
$$;

revoke all on function public.delete_couple_gallery_image(uuid) from public, anon;
grant execute on function public.delete_couple_gallery_image(uuid) to authenticated;

create table if not exists public.love_letters (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.couple_members(user_id) on delete cascade,
  recipient_id uuid not null references public.couple_members(user_id) on delete cascade,
  legacy_source_id text check (legacy_source_id is null or char_length(legacy_source_id) <= 100),
  subject text not null check (char_length(subject) between 1 and 140),
  body text not null check (char_length(body) between 1 and 20000),
  signature text not null default '' check (char_length(signature) <= 100),
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  status text not null default 'sent' check (status in ('sent', 'opened')),
  created_at timestamptz not null default now(),
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id),
  check ((status = 'sent' and opened_at is null) or (status = 'opened' and opened_at is not null)),
  unique (sender_id, legacy_source_id)
);

create index if not exists idx_love_letters_recipient_sent
  on public.love_letters(recipient_id, sent_at desc);
create index if not exists idx_love_letters_sender_sent
  on public.love_letters(sender_id, sent_at desc);

alter table public.love_letters enable row level security;
revoke all on table public.love_letters from public, anon, authenticated;
grant select on table public.love_letters to authenticated;
grant insert (id, sender_id, recipient_id, legacy_source_id, subject, body, signature, attachments)
  on table public.love_letters to authenticated;
grant update (status, opened_at) on table public.love_letters to authenticated;

drop policy if exists love_letters_read_participants on public.love_letters;
create policy love_letters_read_participants on public.love_letters
  for select to authenticated
  using (
    public.is_couple_member()
    and auth.uid() in (sender_id, recipient_id)
  );

drop policy if exists love_letters_send_as_self on public.love_letters;
create policy love_letters_send_as_self on public.love_letters
  for insert to authenticated
  with check (
    public.is_couple_member()
    and sender_id = auth.uid()
    and recipient_id <> auth.uid()
    and status = 'sent'
    and opened_at is null
  );

drop policy if exists love_letters_recipient_open on public.love_letters;
create policy love_letters_recipient_open on public.love_letters
  for update to authenticated
  using (
    public.is_couple_member()
    and recipient_id = auth.uid()
  )
  with check (
    public.is_couple_member()
    and recipient_id = auth.uid()
    and status = 'opened'
    and opened_at is not null
  );

create or replace function public.touch_love_letter_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_love_letter_updated_at() from public, anon, authenticated;
drop trigger if exists touch_love_letter_updated_at on public.love_letters;
create trigger touch_love_letter_updated_at
  before update on public.love_letters
  for each row execute function public.touch_love_letter_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('couple-private', 'couple-private', false, 52428800, null)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = null;

drop policy if exists couple_private_objects_read on storage.objects;
create policy couple_private_objects_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'couple-private'
    and public.is_couple_member()
    and (
      (
        split_part(name, '/', 1) = 'photos'
        and exists (
          select 1
          from public.couple_gallery_images as image
          where image.storage_path = name
        )
      )
      or (
        split_part(name, '/', 1) = 'letters'
        and (
          split_part(name, '/', 2) = auth.uid()::text
          or exists (
            select 1
            from public.love_letters as letter,
              jsonb_array_elements(letter.attachments) as attachment(value)
            where attachment.value ->> 'path' = name
              and auth.uid() in (letter.sender_id, letter.recipient_id)
          )
        )
      )
    )
  );

drop policy if exists couple_private_objects_insert_owner on storage.objects;
create policy couple_private_objects_insert_owner on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'couple-private'
    and public.is_couple_member()
    and coalesce(metadata ->> 'mimetype', '') like 'image/%'
    and coalesce(metadata ->> 'mimetype', '') not like 'image/svg%'
    and case
      when coalesce(metadata ->> 'size', '') ~ '^[0-9]{1,8}$'
        then (metadata ->> 'size')::integer between 1 and 52428800
      else false
    end
    and (
      (
        split_part(name, '/', 1) = 'photos'
        and split_part(name, '/', 2) in ('together', 'phuc', 'anh')
        and split_part(name, '/', 3) = auth.uid()::text
      )
      or (
        split_part(name, '/', 1) = 'letters'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  );

drop policy if exists couple_private_objects_delete_owner on storage.objects;
create policy couple_private_objects_delete_owner on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'couple-private'
    and public.is_couple_member()
    and (
      (
        split_part(name, '/', 1) = 'photos'
        and split_part(name, '/', 3) = auth.uid()::text
      )
      or (
        split_part(name, '/', 1) = 'letters'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  );

-- Existing published journal content becomes visible only after couple sign-in.
-- The old public `gallery` Storage bucket is intentionally not changed.
drop policy if exists public_read_memories on public.memories;
create policy couple_read_memories on public.memories
  for select to authenticated using (public.is_couple_member());

drop policy if exists public_read_gallery on public.gallery_images;
create policy couple_read_gallery on public.gallery_images
  for select to authenticated using (public.is_couple_member());

drop policy if exists public_read_stories on public.stories;
create policy couple_read_stories on public.stories
  for select to authenticated using (public.is_couple_member());

drop policy if exists public_read_notes on public.notes;
create policy couple_read_notes on public.notes
  for select to authenticated using (public.is_couple_member());

drop policy if exists public_read_diary on public.diary_entries;
create policy couple_read_diary on public.diary_entries
  for select to authenticated using (public.is_couple_member());

drop policy if exists public_read_settings on public.site_settings;
create policy couple_read_settings on public.site_settings
  for select to authenticated using (public.is_couple_member());

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    raise exception 'The supabase_realtime publication is required for the shared journal.';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'couple_gallery_images'
  ) then
    execute 'alter publication supabase_realtime add table public.couple_gallery_images';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'love_letters'
  ) then
    execute 'alter publication supabase_realtime add table public.love_letters';
  end if;
end;
$$;
