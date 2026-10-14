import { readStore } from "@/lib/store";
import { reportStoreError } from "@/lib/store-error";
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        const { products } = await readStore();
        return Response.json({ products }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        reportStoreError("GET /api/menu", error);
        return Response.json({ error: "Không thể tải thực đơn" }, { status: 500 });
    }
}
