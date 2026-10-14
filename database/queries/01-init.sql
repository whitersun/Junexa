-- Chọn database junexa trong HeidiSQL trước khi chạy toàn bộ file.
BEGIN;

DO $$
BEGIN
    IF current_database() <> 'junexa' THEN
        RAISE EXCEPTION 'Hãy chọn database junexa trước khi chạy script.';
    END IF;
END
$$;

-- Cấu trúc tương thích với apps/admin/lib/store.ts.
CREATE TABLE IF NOT EXISTS public.junexa_store (
    id integer PRIMARY KEY,
    data jsonb NOT NULL
);

-- Khởi tạo kho trống. Chạy 02-seed.sql để thêm dữ liệu mẫu.
INSERT INTO public.junexa_store (id, data)
VALUES (1, '{"products": [], "bills": []}'::jsonb)
ON CONFLICT (id) DO NOTHING;

COMMIT;
