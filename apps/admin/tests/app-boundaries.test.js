import { afterAll, expect, test, spyOn } from "bun:test";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { statement, statementCsv } from "../lib/statement";

// Route tests use an isolated file, never the developer's database or store.
delete process.env.DATABASE_URL;
process.env.ADMIN_TOKEN = "boundary-test-token";
process.env.NODE_ENV = "test";
process.env.KITCHEN_API_URL = "http://kitchen.test";
const testFile = path.resolve("../../.data", `boundary-test-${crypto.randomUUID()}.json`);
process.env.STORE_FILE = testFile;
await mkdir(path.dirname(testFile), { recursive: true });
const admin = await import("../app/api/store/route");
const menu = await import("../app/api/menu/route");
const orders = await import("../app/api/orders/route");
const billsApi = await import("../app/api/bills/route");
const { publicApi } = await import("../../menu/lib/public-api");
const { requireAdmin } = await import("../lib/admin-auth");
const request = (body, authorized = true) => new Request("http://kitchen.test/api/store", {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(authorized ? { authorization: "Bearer boundary-test-token" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
});
afterAll(async () => { await unlink(testFile).catch(error => { if (error.code !== "ENOENT") throw error; }); });

test("admin requires credentials while public menu never returns invoices", async () => {
    expect((await admin.GET(request(undefined, false))).status).toBe(401);
    expect((await admin.POST(request({ action: "deleteBill", id: "anything" }, false))).status).toBe(401);
    expect((await billsApi.GET(new Request("http://kitchen.test/api/bills"))).status).toBe(401);
    const payload = await (await menu.GET()).json();
    expect(Object.keys(payload)).toEqual(["products"]);
    expect(payload.products.length).toBeGreaterThan(0);
    expect((await admin.GET(request())).status).toBe(200);
});

test("admin changes reach customer menu; submitted orders appear in admin at server prices", async () => {
    const sample = (await (await menu.GET()).json()).products[0];
    const created = await admin.POST(request({ action: "saveProduct", product: { ...sample, id: "", name: "Test dish", price: 19000 } }));
    expect(created.status).toBe(200);
    const product = await created.json();
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
        const forwarded = new Request(url, options);
        expect(forwarded.headers.has("authorization")).toBe(false);
        expect(forwarded.headers.has("cookie")).toBe(false);
        if (new URL(url).pathname === "/api/menu") return menu.GET();
        if (new URL(url).pathname === "/api/orders") return orders.POST(forwarded);
        throw Error("Unexpected endpoint");
    });
    let bill;
    try {
        const publicMenu = await (await publicApi("menu")).json();
        expect(publicMenu.products.find(p => p.id === product.id).price).toBe(19000);
        expect(publicMenu.bills).toBeUndefined();
        const orderRequest = new Request("http://menu.test/api/orders", {
            method: "POST", headers: { authorization: "Bearer boundary-test-token", cookie: "private=secret" },
            body: JSON.stringify({ customer: "Test guest", method: "cash", items: [{ productId: product.id, quantity: 2, price: 1 }], total: 1 }),
        });
        const response = await publicApi("orders", orderRequest);
        expect(response.status).toBe(201);
        bill = await response.json();
        expect(bill.total).toBe(38000);
        expect(bill.status).toBe("pending");
        const stored = await (await admin.GET(request())).json();
        expect(stored.bills.find(b => b.id === bill.id).total).toBe(38000);
        const billsResponse = await billsApi.GET(new Request(`http://kitchen.test/api/bills?search=${bill.id.toUpperCase()}&limit=1`, {
            headers: { authorization: "Bearer boundary-test-token" },
        }));
        expect(billsResponse.status).toBe(200);
        expect(billsResponse.headers.get("cache-control")).toBe("no-store");
        const billsPage = await billsResponse.json();
        expect(billsPage.bills.map(item => item.id)).toEqual([bill.id]);
        expect(billsPage.bills[0].items[0].quantity).toBe(2);
        expect(billsPage.total).toBe(1);
        expect(billsPage.nextCursor).toBeNull();
        const invalidPage = await billsApi.GET(new Request("http://kitchen.test/api/bills?limit=101", {
            headers: { authorization: "Bearer boundary-test-token" },
        }));
        expect(invalidPage.status).toBe(400);
    } finally { fetchMock.mockRestore(); }
    await admin.POST(request({ action: "saveProduct", product: { ...product, price: 29000, available: false } }));
    const invalidOrder = await orders.POST(request({ customer: "Test", method: "cash", items: [{ productId: product.id, quantity: 1 }] }));
    expect(invalidOrder.status).toBe(400);
    const updated = await admin.POST(request({ action: "status", id: bill.id, status: "paid" }));
    expect((await updated.json()).status).toBe("paid");
    const state = await (await admin.GET(request())).json();
    expect(state.bills.find(b => b.id === bill.id).items[0].price).toBe(19000);
    await admin.POST(request({ action: "deleteProduct", id: product.id }));
    expect((await (await menu.GET()).json()).products.some(p => p.id === product.id)).toBe(false);
});

test("production admin fails closed without a configured token", () => {
    const token = process.env.ADMIN_TOKEN;
    process.env.NODE_ENV = "production";
    delete process.env.ADMIN_TOKEN;
    try { expect(requireAdmin(request()).status).toBe(503); }
    finally { process.env.ADMIN_TOKEN = token; process.env.NODE_ENV = "test"; }
});

test("menu shows a recoverable error when its backend is unavailable", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockRejectedValue(Error("offline"));
    try { expect((await publicApi("menu")).status).toBe(502); }
    finally { fetchMock.mockRestore(); }
});

test("statement includes boundary dates and separates paid, pending, demo and cancelled orders", () => {
    const base = { id: "test", customer: '=HYPERLINK("bad")', createdAt: "2026-09-21T12:00:00", method: "cash", status: "paid", total: 100, items: [] };
    const report = statement([base, { ...base, status: "pending", total: 200 }, { ...base, method: "demo", total: 300 }, { ...base, status: "cancelled", total: 400 }, { ...base, createdAt: "2026-09-22T12:00:00", total: 500 }], "2026-09-21", "2026-09-21");
    expect(report.rows).toHaveLength(4);
    expect(report.collected).toBe(100);
    expect(report.pending).toBe(200);
    expect(report.demo).toBe(300);
    expect(statementCsv(report.rows)).toContain("'=HYPERLINK");
});
