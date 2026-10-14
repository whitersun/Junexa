# Junexa Kitchen

Hai ứng dụng Next.js riêng trong một Bun workspace:

| App | Local | Chức năng |
| --- | --- | --- |
| `apps/menu` | http://localhost:3000 | Khách xem thực đơn, chọn món ăn/nước uống, giỏ hàng và gửi đơn |
| `apps/admin` | http://localhost:3001 | Quản trị thực đơn, hóa đơn, doanh thu và sao kê CSV |

## Chạy local

```sh
bun install
bun run dev
```

Hoặc mở hai terminal và chạy riêng:

```sh
bun run dev:menu
bun run dev:admin
```

`bun run dev` khởi động cả hai app. Mỗi app có cấu hình Next.js, layout, route, state và đầu ra `.next` riêng. App menu không có dashboard, API CRUD hoặc API upload.

## Dữ liệu và kết nối

```text
Khách → app menu :3000 → API công khai của admin :3001 → PostgreSQL / file
Quản trị viên → app admin :3001 → API quản trị → cùng nguồn dữ liệu
```

Admin sở hữu backend dùng chung. Menu chỉ chuyển tiếp `GET /api/menu` và `POST /api/orders` qua server; không chuyển tiếp token/cookie của trình duyệt. API công khai chỉ trả thực đơn và hóa đơn vừa đặt, không trả lịch sử hóa đơn của cửa hàng. Admin cần đang chạy để menu tải dữ liệu và gửi đơn.

- `apps/menu/.env.local`: đặt `KITCHEN_API_URL` là origin của admin. Local mặc định `http://localhost:3001`; production bắt buộc cấu hình.
- `apps/admin/.env.local`: `DATABASE_URL`, `ADMIN_TOKEN`, cấu hình R2 và tùy chọn `STORE_FILE`.
- Admin vẫn đọc `.env.local` cũ ở thư mục gốc làm cấu hình dự phòng, nên cấu hình hiện có được giữ. Biến môi trường đã được nạp cho app được ưu tiên.
- Không có `DATABASE_URL`: admin dùng file `.data/store.json` hiện có ở gốc repo. Menu không tạo kho dữ liệu riêng. File chỉ dùng cho local một process.
- Có `DATABASE_URL`: dùng PostgreSQL với bảng `junexa_store`, cập nhật trong transaction và khóa hàng. Có thể chạy database local bằng `docker compose up -d`. Không tự di chuyển dữ liệu file vào PostgreSQL.
- Đặt `STORE_FILE` là đường dẫn tuyệt đối nếu cần thay vị trí file.

Chạy `bun run db:setup` để tạo database nếu chưa có, khởi tạo bảng và thêm dữ liệu mẫu. Có thể tách thành `bun run db:init` và `bun run db:seed`. SQL nằm trong [`database/queries`](database/queries); hướng dẫn terminal và HeidiSQL tại [`database/README.md`](database/README.md). Seed thêm 8 món và 4 hóa đơn mẫu, bỏ qua ID đã có để giữ dữ liệu hiện tại.

Sao chép `.env.example` trong từng app để cấu hình mới. Không đưa `.env.local` vào Git.

## Luồng khách

Chỉ có trang `/`: tìm/lọc món, giỏ hàng, nhập tên và gửi đơn. Mặc định thanh toán tại quầy, đơn mới chờ thanh toán. Chế độ online hiện vẫn là mô phỏng, không thu tiền thật. Server kiểm tra giá, món còn bán và số lượng; hóa đơn giữ giá/tên tại thời điểm đặt.

## Luồng quản trị

- `/` chuyển tới `/dashboard` — tổng quan và doanh thu 7 ngày.
- `/dashboard/menu` — thêm/sửa/xóa món ăn, nước uống; bật/tắt món; ảnh và bản dịch.
- `/dashboard/bills` — xem đơn, chi tiết, cập nhật trạng thái và xóa hóa đơn.
- `/dashboard/finance` — sao kê doanh thu theo ngày tạo đơn, tổng đã thu/chờ thanh toán/tiền mô phỏng và xuất CSV.

Dùng **Làm mới dữ liệu** để tải đơn mới từ khách. Nhập `ADMIN_TOKEN` trong Cài đặt khi được yêu cầu. Token chỉ nằm trong state của app admin; tải lại trang cần nhập lại. Local không cấu hình token vẫn hỗ trợ demo; production từ chối API quản trị nếu chưa cấu hình token. Đây là xác thực bằng mã quản trị, chưa có tài khoản/RBAC.

Doanh thu đã thu không bao gồm đơn hủy hoặc thanh toán mô phỏng. Sao kê lọc theo ngày tạo đơn và múi giờ trình duyệt; đây là báo cáo bán hàng, chưa có dữ liệu chi phí, hoàn tiền hoặc đối soát ngân hàng. CSV giữ số tiền VND và thời gian ISO.

Upload JPEG/PNG/WebP tối đa 5MB qua app admin lên R2, yêu cầu token. Các biến cần có: `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL`. Có thể nhập URL ảnh thay thế.

## Cấu trúc và giao diện

- `apps/menu/app/hooks/use-menu.ts`: state đặt món, không chứa CRUD/token/thống kê.
- `apps/admin/app/hooks/use-kitchen.ts`: state quản trị, không chứa giỏ hàng/checkout.
- `packages/shared`: kiểu dữ liệu, danh mục, bản dịch, hook ngôn ngữ và theme chia thành các partial.
- Mỗi app có component riêng cho mục đích sử dụng. Giữ theme SCSS có sẵn để bảo toàn giao diện; phần bố cục mới dùng UnoCSS. Không gom thêm CSS vào component.
- Hỗ trợ Tiếng Việt, English, 繁體中文.

## Kiểm tra

```sh
bun run typecheck
bun run test
```

Test dùng file tạm riêng, không kết nối database hay sửa `.data/store.json` thật. Bao gồm ranh giới API công khai/quản trị, CRUD → menu → đặt đơn → hóa đơn, giá phía server, trạng thái, sao kê và lỗi backend.

Smoke test HTTP khi cả hai app đã chạy: `bun scripts/smoke.mjs`. Có thể đặt `TEST_ADMIN_URL`, `TEST_MENU_URL` và `ADMIN_TOKEN`. Smoke test tạo rồi dọn dữ liệu tạm trên server được chọn.

## Build / triển khai khi cần

Không tự chạy build sau thay đổi code. Khi muốn build từng app:

```sh
bun run build:menu
bun run build:admin
bun run start:menu
bun run start:admin
```

Triển khai hai app với root lần lượt `apps/menu` và `apps/admin`, giữ quyền truy cập package `packages/shared` trong monorepo. Admin production dùng PostgreSQL, R2 và `ADMIN_TOKEN`; menu cấu hình `KITCHEN_API_URL` trỏ tới admin. Font Google Fonts và ảnh mẫu Unsplash cần internet.
