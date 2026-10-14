import { requireAdmin } from "@/lib/admin-auth";
import { InvalidBillQuery, paginateBills, parseBillQuery } from "@/lib/bill-pagination";
import { readStore } from "@/lib/store";
import { reportStoreError } from "@/lib/store-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const denied = requireAdmin(req);
    if (denied) return denied;

    try {
        const query = parseBillQuery(new URL(req.url).searchParams);
        const store = await readStore();
        return Response.json(paginateBills(store.bills, query), {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        if (error instanceof InvalidBillQuery) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        reportStoreError("GET /api/bills", error);
        return Response.json({ error: "Không thể tải đơn hàng." }, { status: 500 });
    }
}
