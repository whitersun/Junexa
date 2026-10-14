# SQL cho Junexa

Có thể chạy SQL bằng terminal hoặc HeidiSQL. Các lệnh database chỉ chạy khi bạn gọi, không tự chạy cùng dev/build.

## Chạy bằng terminal

Cấu hình `DATABASE_URL` đến database `junexa`, rồi chạy tại thư mục gốc dự án:

```sh
bun run db:setup
```

Lệnh này tạo database nếu chưa có, tạo bảng và thêm 8 món cùng 4 hóa đơn mẫu. PostgreSQL server cần đang chạy; user cần quyền tạo database khi `junexa` chưa tồn tại. Nếu database đã có, script kết nối trực tiếp vào đó.

Muốn tách từng bước:

```sh
bun run db:init
bun run db:seed
```

`db:init` chỉ tạo database/bảng và kho trống. `db:seed` thêm dữ liệu mẫu vào database đã init. Chạy lại các lệnh vẫn giữ nguyên dữ liệu đã có. Script dùng chính các file trong `queries/`, ưu tiên env đã đặt trong terminal, rồi env của `apps/admin`, sau đó env ở gốc dự án như app admin. Không cần cài `psql` để chạy script.

Nếu có lỗi, lệnh trả mã thoát khác 0 và thông báo để kiểm tra cấu hình. Sau khi sửa lỗi có thể chạy lại lệnh.

## Các file SQL

| File | Chức năng |
| --- | --- |
| `queries/00-create-database.sql` | Tạo database `junexa`, chỉ chạy nếu chưa có |
| `queries/01-init.sql` | Tạo bảng `public.junexa_store` và kho dữ liệu trống |
| `queries/02-seed.sql` | Thêm 8 món và 4 hóa đơn mẫu |
| `queries/03-inspect.sql` | Xem số lượng, thực đơn và hóa đơn dạng hàng/cột |

## Chạy trong HeidiSQL

1. Kết nối `127.0.0.1:5432` với user `postgres` và mật khẩu của bạn.
2. Nếu chưa có database `junexa`, chọn database `postgres`, mở file `00-create-database.sql` trong tab Query và chạy câu lệnh. `CREATE DATABASE` phải chạy ngoài transaction. Nếu đã có `junexa`, bỏ qua bước này.
3. Làm mới danh sách database, chọn `junexa`, rồi chạy toàn bộ file `01-init.sql`.
4. Vẫn ở `junexa`, chạy toàn bộ file `02-seed.sql`.
5. Chạy `03-inspect.sql` để kiểm tra. Database mới sẽ có 8 món và 4 hóa đơn.

Nếu script báo lỗi trong transaction, chạy `ROLLBACK;`, xử lý lỗi rồi chạy lại toàn bộ file.

Init giữ dữ liệu đã có. Seed chỉ thêm món/hóa đơn có ID chưa tồn tại, giữ nguyên dữ liệu đã sửa và không nhân đôi khi chạy lại. Các ID hóa đơn mẫu bắt đầu bằng `seed-bill-`; ngày tạo nằm trong 4 ngày gần nhất tại lần thêm đầu tiên. Nếu chạy app trước khi seed, 8 món mặc định đã có sẽ được giữ và 4 hóa đơn mẫu vẫn được thêm.

Các hóa đơn dùng tên “Khách mẫu” để dễ nhận biết: đã thanh toán tiền mặt, chờ thanh toán, thanh toán mô phỏng và đã hủy. Tất cả đều là dữ liệu giả; hóa đơn tiền mặt đã thanh toán sẽ được tính vào doanh thu trên dashboard. Với dữ liệu mẫu nguyên trạng, tổng đã thu là 223.000đ, chờ thanh toán 227.000đ và mô phỏng 69.000đ.

## Kết nối ứng dụng

Sửa `DATABASE_URL` trong `.env.local` hiện có ở gốc dự án, hoặc đặt trong `apps/admin/.env.local` nếu muốn cấu hình riêng admin:

```env
DATABASE_URL=postgresql://postgres:MAT_KHAU@127.0.0.1:5432/junexa
```

Thay `MAT_KHAU` bằng mật khẩu PostgreSQL. Mật khẩu có ký tự đặc biệt cần mã hóa URL, ví dụ `@` thành `%40`. Dấu `$` cần viết `\$` trong file env vì Next.js hỗ trợ mở rộng biến. Không thêm tiền tố `NEXT_PUBLIC_` cho thông tin kết nối.

Khởi động lại app admin sau khi đổi env, rồi mở menu/admin hoặc chọn **Làm mới dữ liệu**. Menu dùng API của admin, vì vậy cả hai app cần đang chạy.

## Cấu trúc hiện tại

Backend đọc một hàng `id = 1` trong bảng `junexa_store`, với `data.products` chứa món và `data.bills` chứa hóa đơn. SQL dùng cấu trúc này để menu và admin đọc được ngay; file `03-inspect.sql` giúp xem từng món/hóa đơn mà không phải đọc toàn bộ JSON.

Admin đang xác thực bằng `ADMIN_TOKEN` trong env, chưa có bảng tài khoản admin. Dữ liệu từ `.data/store.json` không được chuyển tự động; seed tạo dữ liệu mẫu riêng.
