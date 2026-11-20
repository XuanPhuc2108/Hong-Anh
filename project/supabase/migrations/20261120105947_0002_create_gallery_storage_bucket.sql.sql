/*
# Storage bucket cho ảnh nhật ký

1. Mục đích
- Bucket `gallery` chứa ảnh của gallery và nhật ký ảnh.
- Công khai đọc (ai cũng xem được ảnh trên trang).
- Chỉ admin (is_admin()) được upload/ghi/đổi/xóa.

2. Thay đổi
- Tạo bucket `gallery` (public read).
- Storage policies: SELECT công khai; INSERT/UPDATE/DELETE cho admin qua is_admin().
- Cấp quyền storage cho anon (đọc) và authenticated (ghi, RLS lọc).
*/

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Policies cho storage.objects (dựa trên bucket id)
drop policy if exists "public_read_gallery_bucket" on storage.objects;
create policy "public_read_gallery_bucket" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery');

drop policy if exists "admin_insert_gallery_bucket" on storage.objects;
create policy "admin_insert_gallery_bucket" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "admin_update_gallery_bucket" on storage.objects;
create policy "admin_update_gallery_bucket" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "admin_delete_gallery_bucket" on storage.objects;
create policy "admin_delete_gallery_bucket" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());
