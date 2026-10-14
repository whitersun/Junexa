export function requireAdmin(req: Request): Response | null {
    const token = process.env.ADMIN_TOKEN;
    if (!token && process.env.NODE_ENV === "production") {
        return Response.json({ error: "Cần cấu hình ADMIN_TOKEN trên server" }, { status: 503 });
    }
    if (token && req.headers.get("authorization") !== `Bearer ${token}`) {
        return Response.json({ error: "Cần mã quản trị" }, { status: 401 });
    }
    return null;
}
