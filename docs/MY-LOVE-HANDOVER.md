# My Love — handover

## Branch hien tai

- Repository: `XuanPhuc2108/Hong-Anh`
- Branch: `xuanphucn651-update-hong-anh-frontend`
- Target: `main`

## Trang thai

- Pull Request: https://github.com/XuanPhuc2108/Hong-Anh/pull/6
- Commit cuoi: `08f0b8d Add guest mode and private access controls`
- Check GitHub: Vercel SUCCESS
- Da co Guest mode voi ba lua chon truy cap: Phuc, Anh va tham quan.
- Guest chi thay Hero, ba album khoa va phong bi minh hoa.
- Guest khong mount gallery, thu, journal data, Realtime hoac Storage rieng tu.
- Du lieu IndexedDB moi duoc tach theo UUID thanh vien.
- Da them migration siiet anon va private bucket.
- Migration va migration moi chua duoc ap dung vao project Supabase production.
- Tai khoan Phuc/Anh va password khong nam trong source hoac tai lieu nay.

## Migration

- `20261124154500_two_person_shared_journal.sql`: couple members, couple gallery, letters, private bucket va RLS.
- `20261125120000_guest_mode_access_control.sql`: khoa guest cho legacy journal tables, admin_profiles va bucket gallery.

## Cau hinh can thiet

- Supabase project phai bat Email/Password.
- Public signup phai tat.
- Co dung hai UUID trong `couple_members`, ten hien thi chi `Phuc` hoac `Anh`.
- Chay migration tren staging truoc production.
- Frontend chay voi `VITE_SUPABASE_URL` va anon/publishable key.
- Khong dat service-role key trong frontend hoac Vercel frontend environment.
- Redirect URLs phai co origin production, preview va localhost.

## Storage

- `couple-private`: private; chi hai member doc/ghi/xoa theo RLS.
- `gallery`: da duoc private boi migration guest; legacy media dung signed URL.

## Kiem tra

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Guest preview tai `http://127.0.0.1:4173/`

Kiem tra direct REST va Storage khi migration da ap dung tren staging. Guest phai khong nhan duoc hang rieng tu hoac bytes tu bucket.

## Validation khong hoan tat

- Chua ap dung migration production/staging.
- Chua xac minh API anon truc tiep voi du lieu that.
- Chua kiem tra hai tai khoan that vi khong co thong tin session staging duoc cung cap trong repo.
- Chua cau hinh username login cho Anh tren server; khong hardcode email/password.
- Kiem tra deploy va PR se duoc ghi vao phan sau khi push va tao PR.
