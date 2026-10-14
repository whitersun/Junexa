import { readStore, mutate } from "@/lib/store";
import { Product } from "@junexa/shared/data";
import { requireAdmin } from "@/lib/admin-auth";
import { reportStoreError } from "@/lib/store-error";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
    const denied = requireAdmin(req);
    if (denied) return denied;
    try {
        const s = await readStore();
        return Response.json(s, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        reportStoreError("GET /api/store", error);
        return Response.json({ error: "Không thể tải dữ liệu" }, { status: 500 });
    }
}
export async function POST(req: Request) {
    const denied = requireAdmin(req);
    if (denied) return denied;
    try {
        const b = await req.json();
        const result = await mutate((s) => {
            if (b.action === "saveProduct") {
                const p = b.product as Product;
                if (
                    !p.name?.trim() ||
                    !Number.isInteger(p.price) ||
                    p.price <= 0 ||
                    !p.category ||
                    !/^https?:\/\//.test(p.image)
                )
                    throw Error("Tên, giá và URL ảnh không hợp lệ");
                const value = { ...p, id: p.id || crypto.randomUUID() };
                const i = s.products.findIndex((x) => x.id === value.id);
                if (i >= 0) s.products[i] = value;
                else s.products.push(value);
                return value;
            }
            if (b.action === "deleteProduct") {
                s.products = s.products.filter((x) => x.id !== b.id);
                return { ok: true };
            }
            if (b.action === "status") {
                const bill = s.bills.find((x) => x.id === b.id);
                if (!bill || !["pending", "paid", "cancelled"].includes(b.status))
                    throw Error("Hóa đơn không hợp lệ");
                bill.status = b.status;
                return bill;
            }
            if (b.action === "deleteBill") {
                s.bills = s.bills.filter((x) => x.id !== b.id);
                return { ok: true };
            }
            throw Error("Thao tác không hợp lệ");
        });
        return Response.json(result);
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 400 });
    }
}
