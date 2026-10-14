import type { Bill } from "@junexa/shared/data";

export type BillsPage = {
    bills: Bill[];
    total: number;
    totalOrders: number;
    nextCursor: string | null;
};

type BillCursor = { time: number; id: string };
type BillQuery = { search: string; limit: number; cursor: BillCursor | null };

export class InvalidBillQuery extends Error {}

export function parseBillQuery(params: URLSearchParams): BillQuery {
    const search = (params.get("search") || "").trim().replace(/^#/, "").toLowerCase();
    const rawLimit = params.get("limit") ?? "20";
    const limit = Number(rawLimit);
    if (search.length > 128 || !/^\d+$/.test(rawLimit) || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
        throw new InvalidBillQuery("Tham số tìm kiếm không hợp lệ");
    }

    let cursor: BillCursor | null = null;
    const rawCursor = params.get("cursor");
    if (rawCursor !== null) {
        try {
            if (!rawCursor || rawCursor.length > 512 || !/^[\w-]+$/.test(rawCursor)) throw Error();
            const value = JSON.parse(Buffer.from(rawCursor, "base64url").toString("utf8"));
            if (!value || !Number.isSafeInteger(value.time) || typeof value.id !== "string" || !value.id || value.id.length > 128) throw Error();
            cursor = { time: value.time, id: value.id };
        } catch {
            throw new InvalidBillQuery("Vị trí tải thêm không hợp lệ");
        }
    }
    return { search, limit, cursor };
}

export function paginateBills(bills: Bill[], { search, limit, cursor }: BillQuery): BillsPage {
    const matching = bills.filter((bill) => bill.id.toLowerCase().includes(search));
    const ordered = matching
        .map((bill) => ({ bill, time: new Date(bill.createdAt).getTime() }))
        .sort((a, b) => b.time - a.time || (a.bill.id < b.bill.id ? 1 : a.bill.id > b.bill.id ? -1 : 0));
    const remaining = cursor
        ? ordered.filter(({ bill, time }) => time < cursor.time || (time === cursor.time && bill.id < cursor.id))
        : ordered;
    const page = remaining.slice(0, limit);
    const last = page.at(-1);

    return {
        bills: page.map(({ bill }) => bill),
        total: matching.length,
        totalOrders: bills.length,
        nextCursor: remaining.length > limit && last
            ? Buffer.from(JSON.stringify({ time: last.time, id: last.bill.id })).toString("base64url")
            : null,
    };
}
