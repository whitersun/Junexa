import { mutate } from "@/lib/store";
import { Bill } from "@junexa/shared/data";
export async function POST(req: Request) {
    try {
        const b = await req.json();
        const bill = await mutate((s) => {
            if (
                typeof b.customer !== "string" ||
                !b.customer.trim() ||
                !Array.isArray(b.items) ||
                !b.items.length ||
                b.items.length > 100
            )
                throw Error("Vui lòng nhập tên và chọn món");
            if (!["cash", "demo"].includes(b.method))
                throw Error("Phương thức không hợp lệ");
            const items = b.items.map(
                (i: { productId: string; quantity: number }) => {
                    const p = s.products.find((p) => p.id === i.productId && p.available);
                    if (
                        !p ||
                        !Number.isInteger(i.quantity) ||
                        i.quantity < 1 ||
                        i.quantity > 99
                    )
                        throw Error("Món hoặc số lượng không hợp lệ");
                    return {
                        productId: p.id,
                        name: p.name,
                        translations: p.translations,
                        quantity: i.quantity,
                        price: p.price,
                    };
                },
            );
            const bill: Bill = {
                id: crypto.randomUUID(),
                customer: b.customer.trim().slice(0, 100),
                items,
                total: items.reduce(
                    (n: number, i: { price: number; quantity: number }) =>
                        n + i.price * i.quantity,
                    0,
                ),
                status: b.method === "demo" ? "paid" : "pending",
                method: b.method,
                createdAt: new Date().toISOString(),
            };
            s.bills.unshift(bill);
            return bill;
        });
        return Response.json(bill, { status: 201 });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 400 });
    }
}
