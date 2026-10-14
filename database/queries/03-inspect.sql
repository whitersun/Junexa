-- Chạy trong database junexa để xem dữ liệu dưới dạng hàng/cột.
SELECT current_database() AS database;

SELECT
    id,
    jsonb_array_length(data->'products') AS product_count,
    jsonb_array_length(data->'bills') AS bill_count
FROM public.junexa_store
WHERE id = 1;

SELECT product.*
FROM public.junexa_store AS store
CROSS JOIN LATERAL jsonb_to_recordset(store.data->'products') AS product(
    id text, name text, category text, price integer,
    description text, image text, available boolean, badge text
)
WHERE store.id = 1
ORDER BY product.id;

SELECT bill.*
FROM public.junexa_store AS store
CROSS JOIN LATERAL jsonb_to_recordset(store.data->'bills') AS bill(
    id text, customer text, total integer, status text,
    method text, "createdAt" timestamptz, items jsonb
)
WHERE store.id = 1
ORDER BY bill."createdAt" DESC;
