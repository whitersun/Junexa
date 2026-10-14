import { expect, test } from "bun:test";
import { InvalidBillQuery, paginateBills, parseBillQuery } from "../lib/bill-pagination";

const bill = (id, createdAt = "2026-10-09T12:00:00Z") => ({
    id, createdAt, customer: "Guest", items: [], total: 19000, method: "cash", status: "pending",
});
const query = (values = {}) => parseBillQuery(new URLSearchParams(values));

test("pages use deterministic newest-first order, including equal timestamps, and end after all results", () => {
    const bills = Array.from({ length: 45 }, (_, index) => bill(`bill-${String(index).padStart(3, "0")}`));
    let cursor;
    const found = [];
    const sizes = [];
    do {
        const page = paginateBills(bills, query(cursor ? { cursor } : {}));
        found.push(...page.bills.map(item => item.id));
        sizes.push(page.bills.length);
        expect(page.total).toBe(45);
        cursor = page.nextCursor;
    } while (cursor);
    expect(sizes).toEqual([20, 20, 5]);
    expect(new Set(found).size).toBe(45);
    expect(found).toEqual(bills.map(item => item.id).reverse());
    expect(bills[0].id).toBe("bill-000");
});

test("search matches partial and full IDs case-insensitively, accepts #, and searches beyond the first page", () => {
    const bills = [...Array.from({ length: 25 }, (_, i) => bill(`other-${i}`, "2026-10-09T13:00:00Z")), bill("AbC-123-XYZ")];
    const partial = paginateBills(bills, query({ search: "  #ABC-123  " }));
    expect(partial.bills.map(item => item.id)).toEqual(["AbC-123-XYZ"]);
    expect(partial.total).toBe(1);
    expect(partial.totalOrders).toBe(26);
    expect(partial.nextCursor).toBeNull();
    expect(paginateBills(bills, query({ search: "abc-123-xyz" })).total).toBe(1);
    expect(paginateBills(bills, query({ search: "Guest" })).total).toBe(0);
});

test("cursor continues without duplicates or missing older orders after a newer insert and cursor-row deletion", () => {
    const bills = [bill("new", "2026-10-09T15:00:00Z"), bill("middle", "2026-10-09T14:00:00Z"), bill("older", "2026-10-09T13:00:00Z")];
    const first = paginateBills(bills, query({ limit: "2" }));
    const changed = [bill("just-added", "2026-10-09T16:00:00Z"), ...bills.filter(item => item.id !== "middle")];
    const second = paginateBills(changed, query({ limit: "2", cursor: first.nextCursor }));
    expect(second.bills.map(item => item.id)).toEqual(["older"]);
    expect(second.nextCursor).toBeNull();
});

test("empty and unmatched searches have no continuation; different timezone offsets sort by actual time", () => {
    expect(paginateBills([], query())).toEqual({ bills: [], total: 0, totalOrders: 0, nextCursor: null });
    const page = paginateBills([bill("old", "2026-10-09T12:00:00+07:00"), bill("new", "2026-10-09T06:00:00Z")], query());
    expect(page.bills.map(item => item.id)).toEqual(["new", "old"]);
    expect(paginateBills(page.bills, query({ search: "absent" })).nextCursor).toBeNull();
});

test("invalid limits, oversized search strings and malformed cursors are rejected", () => {
    for (const limit of ["0", "101", "-1", "1.5", "abc", "", "Infinity"]) {
        expect(() => query({ limit })).toThrow(InvalidBillQuery);
    }
    expect(() => query({ search: "a".repeat(129) })).toThrow(InvalidBillQuery);
    for (const cursor of ["", "not-a-cursor", "*", Buffer.from(JSON.stringify({ time: 1, id: "" })).toString("base64url")]) {
        expect(() => query({ cursor })).toThrow(InvalidBillQuery);
    }
});
