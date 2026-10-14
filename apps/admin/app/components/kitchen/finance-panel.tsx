import { Button } from "@junexa/ui/components/button";
import { Input } from "@junexa/ui/components/input";
import { Card } from "@junexa/ui/components/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@junexa/ui/components/table";
import { useState } from "react";
import { Download } from "lucide-react";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import { localDate, statement, statementCsv } from "@/lib/statement";
import { locales } from "@junexa/shared/i18n";
type Props = Pick<KitchenController, "data" | "t" | "money" | "language" | "setReceipt">;
export function FinancePanel({ data, t, money, language, setReceipt }: Props) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const invalid = Boolean(from && to && from > to);
    const report = statement(data.bills, from, to);
    function download() {
        const url = URL.createObjectURL(new Blob([statementCsv(report.rows)], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `junexa-${from || "all"}-${to || localDate(new Date().toISOString())}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-2 text-sm">{t("Từ ngày")}<Input className="rounded-lg border border-solid border-divider bg-surface px-3 py-2" type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} /></label>
            <label className="flex flex-col gap-2 text-sm">{t("Đến ngày")}<Input className="rounded-lg border border-solid border-divider bg-surface px-3 py-2" type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} /></label>
            <Button type="button" disabled={invalid || !report.rows.length} onClick={download}><Download size={16} />{t("Xuất CSV")}</Button>
        </div>
        {invalid ? <p role="alert">{t("Ngày kết thúc phải từ ngày bắt đầu trở đi.")}</p> : <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[["Đã thu tại quầy", report.collected], ["Chờ thanh toán", report.pending], ["Thanh toán mô phỏng", report.demo]].map(([label, amount]) => <Card key={label} className="gap-2 border border-divider p-5 ring-0">
                    <p className="text-sm text-muted-foreground">{t(String(label))}</p><strong className="text-xl">{money(Number(amount))}</strong>
                </Card>)}
            </div>
            <p className="text-sm text-muted-foreground">{t("Lọc theo ngày tạo đơn. Tiền mô phỏng và đơn đã hủy không tính vào số tiền đã thu.")}</p>
            <div className="bill-panel"><div className="table-wrap"><Table>
                <TableHeader><TableRow><TableHead>{t("Mã đơn / Khách hàng")}</TableHead><TableHead>{t("Thời gian")}</TableHead><TableHead>{t("Thanh toán")}</TableHead><TableHead>{t("Trạng thái")}</TableHead><TableHead>{t("Tổng tiền")}</TableHead></TableRow></TableHeader>
                <TableBody>{report.rows.map(bill => <TableRow key={bill.id}>
                    <TableCell><Button variant="link" className="h-auto p-0" onClick={() => setReceipt(bill)}>#{bill.id.slice(0, 8).toUpperCase()}</Button><small>{bill.customer}</small></TableCell>
                    <TableCell>{new Date(bill.createdAt).toLocaleString(locales[language])}</TableCell>
                    <TableCell>{t(bill.method === "demo" ? "Online demo" : "Tại quầy")}</TableCell>
                    <TableCell>{t(bill.status === "paid" ? "Đã thanh toán" : bill.status === "pending" ? "Chờ thanh toán" : "Đã hủy")}</TableCell>
                    <TableCell><b>{money(bill.total)}</b></TableCell>
                </TableRow>)}</TableBody>
            </Table>{!report.rows.length && <p className="empty">{t("Không có giao dịch trong khoảng ngày này.")}</p>}</div></div>
        </>}
    </div>;
}
