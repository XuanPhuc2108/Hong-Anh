# Cấu hình nhật ký riêng cho Phúc và Ánh

## Trạng thái

Frontend hiện dùng Supabase Auth, bảng thư/ảnh riêng tư, bucket `couple-private`, RLS và Realtime. Migration bên dưới **chưa được áp dụng** vào bất kỳ project Supabase nào trong quá trình làm việc này. Cần cấu hình hai tài khoản thật và chạy kiểm tra quyền trên project staging trước khi triển khai production.

Không đưa mật khẩu, `service_role` key hoặc nội dung `.env.local` vào tài liệu, frontend hay Vercel.

## 1. Chuẩn bị Supabase

1. Tạo bản backup và chạy thử migration trên staging trước:
   `supabase/migrations/20261124154500_two_person_shared_journal.sql`
2. Migration không xóa dữ liệu hay đổi bucket `gallery`. Migration đổi quyền đọc các bảng nhật ký hiện có từ công khai sang chỉ thành viên; người chưa đăng nhập sẽ không còn đọc được `memories`, `gallery_images`, `diary_entries`, `notes`, `stories` và `site_settings` qua API.
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

Migration tạo bucket private `couple-private` (tệp tối đa 50 MB), RLS cho ảnh/thư, hàm kiểm tra thành viên và thêm bảng ảnh/thư vào publication `supabase_realtime`. Không chỉnh CORS hay bucket `gallery` cũ.

## 2. Kiểm tra quyền trước khi mở production

Thực hiện các bước này trên staging bằng tài khoản test:

| Tài khoản | Hành động | Kết quả cần có |
| --- | --- | --- |
| Chưa đăng nhập | Mở website hoặc truy vấn bảng nhật ký | Chỉ thấy màn đăng nhập; API không trả dữ liệu cá nhân |
| Phúc | Đăng nhập, đăng ảnh, sửa/xóa ảnh của mình | Thành công; ảnh nằm trong bucket private |
| Ánh | Đăng nhập sau đó | Thấy ảnh chung và thư Phúc gửi; không sửa/xóa ảnh do Phúc đăng |
| Ánh | Mở thư nhận được | Nội dung và ảnh đính kèm hiện; trạng thái thư chuyển thành “Đã mở” |
| User không có UUID trong `couple_members` | Đăng nhập hoặc gọi API/Storage | Bị từ chối, không đọc được nội dung hay tệp riêng tư |
| Phúc hoặc Ánh | Mở hai tab và gửi thư/ảnh | Tab còn lại nhận thay đổi qua Realtime; tải lại trang vẫn còn dữ liệu |

Kiểm tra password reset trên staging và xác nhận Vercel preview/production origin đã nằm trong Redirect URLs. Không dùng tài khoản thứ ba trong `couple_members`.

## 3. Dữ liệu cũ và phạm vi riêng tư

- Ảnh và thư từng lưu trong IndexedDB không bị xóa tự động. Ảnh cũ hiện trên thiết bị gốc; có thể mở chi tiết và chọn **Chuyển vào album chung**. Website hỏi xác nhận trước khi upload và chỉ xóa bản cũ sau khi upload thành công.
- Thư cũ nằm trong IndexedDB xuất hiện ở mục thư cũ. **Gửi bản sao** hỏi xác nhận trước khi gửi; mã nguồn cũ được lưu để tránh gửi trùng nếu thao tác dọn dữ liệu cũ bị gián đoạn. Bản nháp vẫn lưu cục bộ trên thiết bị.
- Các lựa chọn âm thanh và những danh sách/ghi chú cục bộ không thuộc album ảnh hoặc thư vẫn giữ cơ chế hiện tại.
- Bucket `gallery` cũ vẫn là bucket public theo cấu hình trước đây. Migration không di chuyển ảnh cũ sang bucket riêng, vì vậy URL công khai của các ảnh cũ vẫn có thể mở được nếu ai đó đã có URL. Muốn đóng quyền truy cập cả ảnh cũ cần một lần chuyển dữ liệu riêng sau khi xác nhận, không đổi bucket này trong migration.
- Không có migration nào reset database hoặc ghi đè nội dung hiện có.
