import { expect, test } from "bun:test";
import { summarizeSoldItems } from "../lib/dashboard-sales";

const dish = { productId: "dish-1", name: "Món đã xóa", quantity: 2, price: 19000, translations: { en: { name: "Deleted dish" } } };
const bill = { id: "order-1", customer: "Guest", items: [dish], total: 38000, status: "paid", method: "cash", createdAt: "2026-10-09T12:00:00Z" };

test("sales count quantities across paid orders and exclude pending, cancelled and demo orders", () => {
    const items = summarizeSoldItems([
        bill,
        { ...bill, id: "order-2", items: [{ ...dish, quantity: 3 }] },
        { ...bill, status: "pending" },
        { ...bill, status: "cancelled" },
        { ...bill, method: "demo" },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
    expect(items[0].name).toBe("Món đã xóa");
    expect(items[0].translations.en.name).toBe("Deleted dish");
    expect(dish.quantity).toBe(2);
});

test("different products with the same name stay separate and sort by quantity sold", () => {
    const items = summarizeSoldItems([{ ...bill, items: [dish, { ...dish, productId: "dish-2", quantity: 4 }] }]);
    expect(items.map(item => [item.productId, item.quantity])).toEqual([["dish-2", 4], ["dish-1", 2]]);
    expect(items.reduce((sum, item) => sum + item.quantity, 0)).toBe(6);
});

test("stores without completed sales return an empty list", () => {
    expect(summarizeSoldItems([])).toEqual([]);
    expect(summarizeSoldItems([{ ...bill, status: "pending" }, { ...bill, method: "demo" }])).toEqual([]);
});
