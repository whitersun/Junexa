import type { Bill } from "@junexa/shared/data";
export function localDate(value: string) {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function statement(bills: Bill[], from: string, to: string) {
    const rows = bills.filter(bill => {
        const day = localDate(bill.createdAt);
        return (!from || day >= from) && (!to || day <= to);
    });
    return {
        rows,
        collected: rows.filter(b => b.status === "paid" && b.method !== "demo").reduce((sum, b) => sum + b.total, 0),
        pending: rows.filter(b => b.status === "pending" && b.method !== "demo").reduce((sum, b) => sum + b.total, 0),
        demo: rows.filter(b => b.status === "paid" && b.method === "demo").reduce((sum, b) => sum + b.total, 0),
    };
}
export function statementCsv(rows: Bill[]) {
    // Quote every cell and neutralize spreadsheet formulas in customer-supplied values.
    const cell = (value: string | number) => `"${String(value).replace(/^[\s]*[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const header = ["Mã đơn", "Ngày tạo (ISO)", "Khách hàng", "Phương thức", "Trạng thái", "Tổng tiền (VND)"];
    return "\uFEFF" + [header, ...rows.map(b => [b.id, b.createdAt, b.customer, b.method, b.status, b.total])].map(row => row.map(cell).join(",")).join("\r\n");
}
