# Deploy Junexa lên Netlify

Hai site dùng cùng repository `whitersun/Junexa`, nhánh `main`. Cài dependencies
ở gốc repository để hai app truy cập được `packages/shared` và `packages/ui`.
Mỗi app có `netlify.toml` riêng. Không đặt Base directory thành thư mục của app.

| Cấu hình | Admin | Menu |
| --- | --- | --- |
| Base directory | Để trống (gốc repo) | Để trống (gốc repo) |
| Package directory | `apps/admin` | `apps/menu` |
| Build command | `bun run build:admin` | `bun run build:menu` |
| Publish directory | `apps/admin/.next` | `apps/menu/.next` |

Netlify tự cấu hình adapter Next.js. Không cần thêm redirect SPA hoặc dùng
static export vì dự án có API chạy trên server.

## 1. Tạo database Neon

- Tạo project `junexa`, chọn AWS Singapore và dịch vụ Postgres.
- Tạo database tên `junexa` nếu muốn dùng các script `db:init` / `db:seed` có sẵn.
- Trong Connect, chọn database và bật connection pooling. Giữ các tham số SSL
  trong connection string Neon cung cấp.
- Connection string dùng làm `DATABASE_URL` của admin. Không đưa vào Git.

Admin tự khởi tạo bảng `junexa_store` và thực đơn ban đầu khi đọc dữ liệu lần đầu.
Không cần chạy seed hóa đơn mẫu cho cửa hàng thật. Dữ liệu cũ trong
`.data/store.json` không tự chuyển sang Neon.

## 2. Deploy admin trước

Import repository từ GitHub, chọn app admin và kiểm tra cấu hình trong bảng.
Thêm các biến trong Netlify, áp dụng cho runtime Functions:

- `DATABASE_URL`: connection string Neon có pooling.
- `ADMIN_TOKEN`: mã bí mật dùng để truy cập API quản trị.
- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_URL`

Giữ khóa R2 và database trong biến môi trường Netlify; không thêm tiền tố
`NEXT_PUBLIC_` và không ghi giá trị bí mật vào `netlify.toml`.

Admin có API công khai cho menu, nên URL admin phải truy cập được từ server menu.
Nếu Netlify bật chế độ project private yêu cầu đăng nhập, cấu hình visibility
phù hợp trước khi nối menu. API quản trị vẫn yêu cầu `ADMIN_TOKEN`.

## 3. Deploy menu

Import cùng repository lần nữa, chọn app menu và kiểm tra cấu hình trong bảng.
Thêm `KITCHEN_API_URL` bằng origin HTTPS của admin, không kèm `/api`.
Ví dụ: `https://your-admin-site.netlify.app`.

Menu không cần token quản trị, khóa R2 hoặc connection string database.

## 4. Kiểm tra sau deploy

- Menu hiển thị thực đơn từ admin.
- Admin nhận `ADMIN_TOKEN` và tải được dữ liệu.
- Upload ảnh R2 hoạt động, ảnh hiển thị được trên menu.
- Đặt một đơn thử và xác nhận đơn xuất hiện trong admin.
- Tải lại trang để xác nhận dữ liệu được giữ trong Neon.

Bấm Deploy sẽ chạy build trên Netlify. Sau khi đã liên kết Git, push commit mới
cũng có thể tự chạy build. Chỉ kích hoạt khi bạn muốn deploy.

Tài liệu:
- [Netlify monorepos](https://docs.netlify.com/build/configure-builds/monorepos/)
- [Next.js trên Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
