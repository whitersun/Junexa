import type { Bill } from "@junexa/shared/data";

type SoldItem = Pick<Bill["items"][number], "productId" | "name" | "translations" | "quantity">;

export function summarizeSoldItems(bills: Bill[]): SoldItem[] {
    const items = new Map<string, SoldItem>();

    for (const bill of bills) {
        if (bill.status !== "paid" || bill.method === "demo") continue;

        for (const item of bill.items) {
            const existing = items.get(item.productId);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                // Use the order snapshot so deleted menu items remain in sales history.
                items.set(item.productId, {
                    productId: item.productId,
                    name: item.name,
                    translations: item.translations,
                    quantity: item.quantity,
                });
            }
        }
    }

    return [...items.values()].sort((a, b) => b.quantity - a.quantity);
}
