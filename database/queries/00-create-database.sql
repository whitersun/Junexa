-- Chạy khi đang kết nối database postgres, nếu junexa chưa tồn tại.
-- Chạy riêng câu lệnh này, ngoài transaction.
CREATE DATABASE junexa WITH ENCODING = 'UTF8' TEMPLATE = template0;
