// Fixed public endpoints only. Never forward browser credentials to the admin service.
export async function publicApi(endpoint: "menu" | "orders", req?: Request) {
    try {
        const origin = process.env.KITCHEN_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
        if (!origin) return Response.json({ error: "Chưa cấu hình kết nối cửa hàng" }, { status: 503 });
        const response = await fetch(new URL(`/api/${endpoint}`, origin), {
            method: req ? "POST" : "GET",
            headers: req ? { "Content-Type": "application/json" } : undefined,
            body: req ? await req.text() : undefined,
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
        });
        const data = await response.json();
        return Response.json(data, { status: response.status, headers: { "Cache-Control": "no-store" } });
    } catch {
        return Response.json({ error: "Chưa kết nối được cửa hàng. Vui lòng thử lại." }, { status: 502 });
    }
}
