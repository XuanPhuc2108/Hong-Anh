# Cấu hình nhật ký riêng cho Phúc và Ánh

## Trạng thái

Frontend có chế độ khách chỉ tải nội dung tĩnh; ảnh, thư và nhật ký chỉ được tải sau khi xác minh UUID thành viên. Migration riêng tư hiện có và migration `20261125120000_guest_mode_access_control.sql` **chưa được áp dụng** vào bất kỳ project Supabase nào trong quá trình làm việc này. Cần chạy cả hai trên staging và kiểm tra quyền trực tiếp qua API trước khi triển khai production.

Không đưa mật khẩu, `service_role` key hoặc nội dung `.env.local` vào tài liệu, frontend hay Vercel.

## 1. Chuẩn bị Supabase

1. Tạo bản backup và chạy lần lượt hai migration trên staging:
   - `supabase/migrations/20261124154500_two_person_shared_journal.sql`
   - `supabase/migrations/20261125120000_guest_mode_access_control.sql`
2. Migration mới không xóa dữ liệu. Nó chuyển bucket `gallery` cũ sang private, bỏ policy đọc công khai và giới hạn đọc/ghi object vào hai thành viên. Website dùng signed URL cho ảnh cũ; không dùng public URL.
3. Trong Supabase Auth, bật Email/Password, tắt public sign-up, rồi mời hoặc tạo đúng hai tài khoản. Người dùng không thể tự đăng ký từ website.
4. Sao chép UUID của hai user từ Auth dashboard và thêm vào allowlist bằng SQL Editor. Thay placeholder bằng UUID thật:

   ```sql
   insert into public.couple_members (user_id, display_name)
   values
     ('<UUID_PHUC>', 'Phúc'),
     ('<UUID_ANH>', 'Ánh');
   ```

   Bảng chỉ chấp nhận hai tên định danh `Phúc` và `Ánh`; quyền được xác định bằng UUID, không dựa vào email hay dữ liệu do frontend gửi.
5. Trong Auth URL Configuration, thêm origin của production, preview và localhost vào Redirect URLs để email khôi phục mật khẩu quay lại đúng website.
6. Giữ các biến frontend hiện có: `VITE_SUPABASE_URL` và một trong `VITE_SUPABASE_ANON_KEY` hoặc `VITE_SUPABASE_PUBLISHABLE_KEY`. Chỉ dùng public client key; không đặt service-role key trong Vercel frontend.
7. Triển khai Edge Function `couple-login` và đặt `SUPABASE_SERVICE_ROLE_KEY` trong Supabase Function secrets. Đây là secret server-side, không đưa vào frontend hay Vercel.
8. Gán username `honganh` cho đúng UUID Ánh bằng server-side app_metadata. Chỉ thực hiện bằng Supabase admin API hoặc Edge Function admin đã xác thực; không thêm trường username do frontend/user metadata tự quản.

Migration tạo bucket private `couple-private` (tệp tối đa 50 MB), RLS cho ảnh/thư, hàm kiểm tra thành viên và thêm bảng ảnh/thư vào publication `supabase_realtime`. Migration guest cũng siết các bảng nhật ký cũ, bao gồm `admin_profiles`, và bucket `gallery`. Không chỉnh CORS.

## 2. Kiểm tra quyền trước khi mở production

Thực hiện các bước này trên staging bằng tài khoản test:

| Tài khoản | Hành động | Kết quả cần có |
| --- | --- | --- |
| Guest | Vào website, mở ba album và mục thư | Thấy nội dung giới thiệu tĩnh và giao diện khóa; không có ảnh/thư hoặc metadata riêng tư |
| Guest | Gọi API trực tiếp tới bảng riêng tư, liệt kê bucket hoặc lấy object URL | API không trả hàng dữ liệu; Storage từ chối list/read/sign/upload |
| Guest | Thử upload hoặc tạo/sửa/xóa bản ghi | Bị từ chối bởi API/RLS và Storage policy |
| Phúc | Đăng nhập, đăng ảnh, sửa/xóa ảnh của mình | Thành công; ảnh nằm trong bucket private |
| Ánh | Đăng nhập sau đó | Thấy ảnh chung và thư Phúc gửi; không sửa/xóa ảnh do Phúc đăng |
| Ánh | Mở thư nhận được | Nội dung và ảnh đính kèm hiện; trạng thái thư chuyển thành “Đã mở” |
| User đã đăng nhập nhưng UUID không có trong `couple_members` | Gọi API/Storage trực tiếp | Không đọc/ghi được nội dung hay tệp riêng tư |
| Phúc hoặc Ánh | Đăng xuất rồi vào chế độ khách hoặc đăng nhập tài khoản còn lại | Không còn dữ liệu, ảnh, bản nháp hay subscription của phiên trước |
| Phúc hoặc Ánh | Mở hai tab và gửi thư/ảnh | Tab còn lại nhận thay đổi qua Realtime; tải lại trang vẫn còn dữ liệu |

Thực hiện các request anon từ terminal bằng URL, anon key và đường dẫn object thử nghiệm của staging (không dùng service-role key):

```sh
curl -i "$SUPABASE_URL/rest/v1/couple_gallery_images?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

curl -i "$SUPABASE_URL/rest/v1/memories?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

curl -i "$SUPABASE_URL/rest/v1/love_letters?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

curl -i -X POST "$SUPABASE_URL/storage/v1/object/list/gallery" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  --data '{"prefix":"","limit":1,"offset":0}'

curl -i "$SUPABASE_URL/storage/v1/object/public/gallery/<KNOWN_STAGING_OBJECT_PATH>" \
  -H "apikey: $SUPABASE_ANON_KEY"

curl -i -X POST "$SUPABASE_URL/storage/v1/object/sign/couple-private/<KNOWN_STAGING_OBJECT_PATH>" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  --data '{"expiresIn":60}'
```

Kết quả REST của bảng có thể là HTTP 200 với danh sách rỗng do RLS; điều quan trọng là không có hàng riêng tư. Storage list/read/sign phải trả lỗi 4xx và không có URL hoặc bytes. Cũng thử upload anon qua Storage API. Kiểm tra password reset trên staging và xác nhận Vercel preview/production origin đã nằm trong Redirect URLs. Không thêm tài khoản thứ ba vào `couple_members`.

## 3. Dữ liệu cũ và phạm vi riêng tư

- Ảnh và thư mới lưu cục bộ theo UUID thành viên trong IndexedDB riêng; bản nháp, danh sách muốn làm, ghi chú cá nhân và câu trả lời hôm nay cũng được tách theo tài khoản.
- Dữ liệu IndexedDB cũ trước khi tách theo UUID vẫn còn nguyên trong kho cũ nhưng không tự hiển thị cho Phúc hoặc Ánh vì không xác định được chủ sở hữu. Không gán dữ liệu đó tự động cho một tài khoản.
- Tùy chọn âm thanh vẫn lưu trên thiết bị như trước; không chứa nội dung riêng tư của hai thành viên.
- Bucket `gallery` cũ được đặt private bởi migration mới; các URL public cũ không còn là cách xem hợp lệ sau khi migration áp dụng. Signed URL chỉ được cấp cho user đã đăng nhập và được xác minh là một trong hai thành viên.
- Không có migration nào reset database hoặc ghi đè nội dung hiện có.
