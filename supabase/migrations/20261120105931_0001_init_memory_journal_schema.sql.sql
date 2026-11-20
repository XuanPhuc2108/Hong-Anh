/*
# Khởi tạo schema cho "Nhật ký nhỏ cho Ánh"

1. Mục đích
- Lưu trữ nội dung trang nhật ký: kỷ niệm (timeline), ảnh gallery, câu chuyện, điều nhỏ bé (notes), nhật ký ảnh, và cài đặt site.
- Hỗ trợ nhiều admin trong tương lai thông qua bảng `admin_profiles` liên kết với auth.users.
- Công khai đọc (anon), chỉ admin đã đăng nhập mới ghi/sửa/xóa.

2. Bảng mới
- `admin_profiles`: ánh xạ user_id Supabase Auth -> vai trò admin. Cờ `is_admin` thật nằm ở app_meta_data (server-side), bảng này chỉ là danh bạ hiển thị + bộ lọc.
- `memories`: các mốc timeline (date, title, description, photo_url, ordering).
- `gallery_images`: ảnh gallery (storage_path, caption, span, ordering).
- `stories`: mục câu chuyện dài (title, body, photo_url).
- `notes`: "điều nhỏ bé" (title, body, ordering).
- `diary_entries`: trang nhật ký ảnh (photo_url, caption, date, ordering).
- `site_settings`: cấu hình dạng key/value (hero text, letter body, v.v.).

3. Bảo mật
- RLS bật trên mọi bảng.
- SELECT công khai cho anon + authenticated (trang đọc cho mọi người).
- INSERT/UPDATE/DELETE chỉ cho authenticated VÀ là admin (kiểm tra qua hàm is_admin() đọc raw_app_meta_data->>'is_admin' = 'true').
- Hàm is_admin() SECURITY DEFINER, an toàn, chỉ đọc app meta.
- Storage bucket `gallery` công khai đọc, ghi qua policy dựa trên is_admin().
*/

-- Hàm kiểm tra admin: đọc app_meta_data (user không thể tự sửa).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, anon;

-- admin_profiles: danh bạ admin (không phải nguồn sự thật cho quyền).
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Quản trị viên',
  created_at timestamptz not null default now()
);

-- memories (timeline)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  date text,
  title text not null,
  description text,
  photo_url text,
  ordering int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- gallery_images
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  caption text,
  span text not null default 'square' check (span in ('tall','wide','square','big')),
  ordering int not null default 0,
  created_at timestamptz not null default now()
);

-- stories
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  photo_url text,
  ordering int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- notes (little things)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  ordering int not null default 0,
  created_at timestamptz not null default now()
);

-- diary_entries
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  caption text,
  date text,
  ordering int not null default 0,
  created_at timestamptz not null default now()
);

-- site_settings (key/value)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- ===== RLS =====
alter table public.admin_profiles enable row level security;
alter table public.memories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.stories enable row level security;
alter table public.notes enable row level security;
alter table public.diary_entries enable row level security;
alter table public.site_settings enable row level security;

-- Grants: SELECT công khai; ghi chỉ cho authenticated (RLS sẽ lọc thêm is_admin).
grant select on public.admin_profiles to anon, authenticated;
grant select on public.memories to anon, authenticated;
grant select on public.gallery_images to anon, authenticated;
grant select on public.stories to anon, authenticated;
grant select on public.notes to anon, authenticated;
grant select on public.diary_entries to anon, authenticated;
grant select on public.site_settings to anon, authenticated;

grant insert, update, delete on public.memories to authenticated;
grant insert, update, delete on public.gallery_images to authenticated;
grant insert, update, delete on public.stories to authenticated;
grant insert, update, delete on public.notes to authenticated;
grant insert, update, delete on public.diary_entries to authenticated;
grant update on public.site_settings to authenticated;
grant insert on public.site_settings to authenticated;
-- admin_profiles: admin tự đọc, ghi qua edge function/setup.
grant select on public.admin_profiles to authenticated;

-- Helper macro: gom policy công khai (SELECT) cho một bảng.
-- Ta viết tay từng bảng cho rõ ràng.

-- memories
drop policy if exists "public_read_memories" on public.memories;
create policy "public_read_memories" on public.memories
  for select to anon, authenticated using (true);

drop policy if exists "admin_insert_memories" on public.memories;
create policy "admin_insert_memories" on public.memories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin_update_memories" on public.memories;
create policy "admin_update_memories" on public.memories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_delete_memories" on public.memories;
create policy "admin_delete_memories" on public.memories
  for delete to authenticated using (public.is_admin());

-- gallery_images
drop policy if exists "public_read_gallery" on public.gallery_images;
create policy "public_read_gallery" on public.gallery_images
  for select to anon, authenticated using (true);

drop policy if exists "admin_insert_gallery" on public.gallery_images;
create policy "admin_insert_gallery" on public.gallery_images
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin_update_gallery" on public.gallery_images;
create policy "admin_update_gallery" on public.gallery_images
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_delete_gallery" on public.gallery_images;
create policy "admin_delete_gallery" on public.gallery_images
  for delete to authenticated using (public.is_admin());

-- stories
drop policy if exists "public_read_stories" on public.stories;
create policy "public_read_stories" on public.stories
  for select to anon, authenticated using (true);

drop policy if exists "admin_insert_stories" on public.stories;
create policy "admin_insert_stories" on public.stories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin_update_stories" on public.stories;
create policy "admin_update_stories" on public.stories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_delete_stories" on public.stories;
create policy "admin_delete_stories" on public.stories
  for delete to authenticated using (public.is_admin());

-- notes
drop policy if exists "public_read_notes" on public.notes;
create policy "public_read_notes" on public.notes
  for select to anon, authenticated using (true);

drop policy if exists "admin_insert_notes" on public.notes;
create policy "admin_insert_notes" on public.notes
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin_update_notes" on public.notes;
create policy "admin_update_notes" on public.notes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_delete_notes" on public.notes;
create policy "admin_delete_notes" on public.notes
  for delete to authenticated using (public.is_admin());

-- diary_entries
drop policy if exists "public_read_diary" on public.diary_entries;
create policy "public_read_diary" on public.diary_entries
  for select to anon, authenticated using (true);

drop policy if exists "admin_insert_diary" on public.diary_entries;
create policy "admin_insert_diary" on public.diary_entries
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin_update_diary" on public.diary_entries;
create policy "admin_update_diary" on public.diary_entries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_delete_diary" on public.diary_entries;
create policy "admin_delete_diary" on public.diary_entries
  for delete to authenticated using (public.is_admin());

-- site_settings
drop policy if exists "public_read_settings" on public.site_settings;
create policy "public_read_settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "admin_upsert_settings" on public.site_settings;
create policy "admin_upsert_settings" on public.site_settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admin_update_settings" on public.site_settings;
create policy "admin_update_settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_profiles: authenticated đọc; chỉ admin ghi (setup qua edge function).
drop policy if exists "authed_read_admin_profiles" on public.admin_profiles;
create policy "authed_read_admin_profiles" on public.admin_profiles
  for select to authenticated using (true);

drop policy if exists "admin_insert_admin_profile" on public.admin_profiles;
create policy "admin_insert_admin_profile" on public.admin_profiles
  for insert to authenticated with check (public.is_admin());

-- Indexes cho ordering
create index if not exists idx_memories_ordering on public.memories(ordering);
create index if not exists idx_gallery_ordering on public.gallery_images(ordering);
create index if not exists idx_stories_ordering on public.stories(ordering);
create index if not exists idx_notes_ordering on public.notes(ordering);
create index if not exists idx_diary_ordering on public.diary_entries(ordering);
