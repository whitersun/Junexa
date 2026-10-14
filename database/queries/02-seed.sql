-- Chạy sau 01-init.sql, trong database junexa.
-- Chỉ thêm ID chưa có; giữ nguyên món và hóa đơn đã tồn tại.
BEGIN;

DO $$
BEGIN
    IF current_database() <> 'junexa' THEN
        RAISE EXCEPTION 'Hãy chọn database junexa trước khi chạy script.';
    END IF;
END
$$;

WITH sample_products AS (
    SELECT $products$
    [
        {
            "id": "p1",
            "name": "Burger bò phô mai",
            "category": "Burger",
            "price": 89000,
            "description": "Bò nướng mọng nước, cheddar & sốt đặc biệt",
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
            "available": true,
            "badge": "Bán chạy"
        },
        {
            "id": "p2",
            "name": "Pizza Margherita",
            "category": "Pizza",
            "price": 129000,
            "description": "Mozzarella, cà chua tươi & lá basil",
            "image": "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85",
            "available": true,
            "badge": "Yêu thích"
        },
        {
            "id": "p3",
            "name": "Salad vườn xanh",
            "category": "Ăn nhẹ",
            "price": 69000,
            "description": "Rau xanh tươi, bơ & sốt mè rang",
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
            "available": true
        },
        {
            "id": "p4",
            "name": "Mì Ý sốt bò bằm",
            "category": "Món chính",
            "price": 99000,
            "description": "Pasta al dente cùng sốt Bolognese đậm đà",
            "image": "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=900&q=85",
            "available": true
        },
        {
            "id": "p5",
            "name": "Cà phê latte",
            "category": "Đồ uống",
            "price": 45000,
            "description": "Espresso thơm nồng, sữa tươi béo mịn",
            "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85",
            "available": true,
            "badge": "Must try"
        },
        {
            "id": "p6",
            "name": "Pancake trái cây",
            "category": "Tráng miệng",
            "price": 69000,
            "description": "Bánh mềm xốp, trái cây tươi & mật ong",
            "image": "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85",
            "available": true
        },
        {
            "id": "p7",
            "name": "Khoai tây chiên",
            "category": "Ăn nhẹ",
            "price": 39000,
            "description": "Giòn rụm bên ngoài, mềm thơm bên trong",
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
            "available": true
        },
        {
            "id": "p8",
            "name": "Trà đào cam sả",
            "category": "Đồ uống",
            "price": 49000,
            "description": "Trà thanh mát với đào và cam tươi",
            "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85",
            "available": true
        }
    ]
    $products$::jsonb AS data
), bill_templates AS (
    SELECT $bills$
    [
        {
            "id": "seed-bill-paid",
            "customer": "Khách mẫu · Đã thanh toán",
            "items": [
                {"productId": "p1", "name": "Burger bò phô mai", "quantity": 2, "price": 89000},
                {"productId": "p5", "name": "Cà phê latte", "quantity": 1, "price": 45000}
            ],
            "total": 223000,
            "status": "paid",
            "method": "cash"
        },
        {
            "id": "seed-bill-pending",
            "customer": "Khách mẫu · Chờ thanh toán",
            "items": [
                {"productId": "p2", "name": "Pizza Margherita", "quantity": 1, "price": 129000},
                {"productId": "p8", "name": "Trà đào cam sả", "quantity": 2, "price": 49000}
            ],
            "total": 227000,
            "status": "pending",
            "method": "cash"
        },
        {
            "id": "seed-bill-demo",
            "customer": "Khách mẫu · Thanh toán mô phỏng",
            "items": [
                {"productId": "p3", "name": "Salad vườn xanh", "quantity": 1, "price": 69000}
            ],
            "total": 69000,
            "status": "paid",
            "method": "demo"
        },
        {
            "id": "seed-bill-cancelled",
            "customer": "Khách mẫu · Đã hủy",
            "items": [
                {"productId": "p6", "name": "Pancake trái cây", "quantity": 1, "price": 69000}
            ],
            "total": 69000,
            "status": "cancelled",
            "method": "cash"
        }
    ]
    $bills$::jsonb AS data
), sample_bills AS (
    -- Ngày tạo nằm trong 4 ngày gần nhất để xuất hiện trên dashboard.
    SELECT jsonb_agg(
        jsonb_set(bill, '{createdAt}', to_jsonb(to_char(
            (CURRENT_TIMESTAMP - (position - 1) * INTERVAL '1 day') AT TIME ZONE 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ))) ORDER BY position
    ) AS data
    FROM bill_templates
    CROSS JOIN LATERAL jsonb_array_elements(data) WITH ORDINALITY AS sample(bill, position)
)
INSERT INTO public.junexa_store AS store (id, data)
SELECT 1, jsonb_build_object('products', sample_products.data, 'bills', sample_bills.data)
FROM sample_products CROSS JOIN sample_bills
ON CONFLICT (id) DO UPDATE
SET data = store.data || jsonb_build_object(
    'products', (store.data->'products') || COALESCE((
        SELECT jsonb_agg(sample.product ORDER BY sample.position)
        FROM jsonb_array_elements(EXCLUDED.data->'products') WITH ORDINALITY AS sample(product, position)
        WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(store.data->'products') AS existing(product)
            WHERE existing.product->>'id' = sample.product->>'id'
        )
    ), '[]'::jsonb),
    'bills', COALESCE((
        SELECT jsonb_agg(sample.bill ORDER BY sample.position)
        FROM jsonb_array_elements(EXCLUDED.data->'bills') WITH ORDINALITY AS sample(bill, position)
        WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(store.data->'bills') AS existing(bill)
            WHERE existing.bill->>'id' = sample.bill->>'id'
        )
    ), '[]'::jsonb) || (store.data->'bills')
);

COMMIT;
