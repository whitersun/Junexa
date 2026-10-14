import assert from "node:assert/strict";
const adminBase = process.env.TEST_ADMIN_URL || "http://localhost:3001";
const menuBase = process.env.TEST_MENU_URL || "http://localhost:3000";
const request = async (path, body) => {
    const base = path === "/api/orders" || path === "/api/menu" ? menuBase : adminBase;
    const r = await fetch(base + path, {
        method: body ? "POST" : "GET",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${process.env.ADMIN_TOKEN || ""}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, data: await r.json() };
};
const initial = (await request("/api/store")).data;
const publicMenu = await request("/api/menu");
assert.equal(publicMenu.status, 200);
assert.equal(publicMenu.data.bills, undefined);
const sample = {
    ...initial.products[0],
    id: "",
    name: "Smoke test temporary",
    price: 17000,
};
const created = await request("/api/store", {
    action: "saveProduct",
    product: sample,
});
assert.equal(created.status, 200);
const id = created.data.id;
let billId;
try {
    assert.equal(
        (
            await request("/api/store", {
                action: "saveProduct",
                product: { ...created.data, price: 19000 },
            })
        ).status,
        200,
    );
    const bad = await request("/api/orders", {
        customer: "Test",
        method: "demo",
        items: [{ productId: id, quantity: -1 }],
    });
    assert.equal(bad.status, 400);
    const order = await request("/api/orders", {
        customer: "Smoke test",
        method: "demo",
        items: [{ productId: id, quantity: 2, price: 1 }],
        total: 1,
    });
    assert.equal(order.status, 201);
    billId = order.data.id;
    assert.equal(order.data.total, 38000);
    assert.equal(order.data.status, "paid");
    await request("/api/store", {
        action: "saveProduct",
        product: { ...created.data, price: 29000, available: false },
    });
    const state = (await request("/api/store")).data;
    assert.equal(state.bills.find((b) => b.id === billId).items[0].price, 19000);
    assert.equal(
        (
            await request("/api/orders", {
                customer: "Test",
                method: "cash",
                items: [{ productId: id, quantity: 1 }],
            })
        ).status,
        400,
    );
    assert.equal(
        (
            await request("/api/store", {
                action: "status",
                id: billId,
                status: "cancelled",
            })
        ).data.status,
        "cancelled",
    );
    console.log(
        "PASS: menu CRUD, server pricing, quantity validation, sold-out validation, bill snapshot and status",
    );
} finally {
    await request("/api/store", { action: "deleteProduct", id });
    if (billId) await request("/api/store", { action: "deleteBill", id: billId });
}
const final = (await request("/api/store")).data;
assert.equal(final.products.length, initial.products.length);
assert.equal(final.bills.length, initial.bills.length);
console.log("PASS: temporary test data cleaned");
