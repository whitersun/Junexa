import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@junexa/ui/components/table";
import { Button } from "@junexa/ui/components/button";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import { locales } from "@junexa/shared/i18n";
import { ReceiptText, Trash2 } from "lucide-react";
type BillsPanelProps = Pick<
    KitchenController,
    | "language"
    | "t"
    | "money"
    | "view"
    | "data"
    | "busy"
    | "setReceipt"
    | "admin"
>;
export function BillsPanel({
    language,
    t,
    money,
    view,
    data,
    busy,
    setReceipt,
    admin,
}: BillsPanelProps) {
    return (
        <div className="bill-panel">
            <div className="menu-title">
                <h2>
                    {view === "dashboard"
                        ? t("Đơn hàng gần đây")
                        : t("Tất cả hóa đơn")}{" "}
                    <span>
                        {data.bills.length} {t("đơn")}
                    </span>
                </h2>
            </div>
            <div className="table-wrap">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("Mã đơn / Khách hàng")}</TableHead>
                            <TableHead>{t("Thời gian")}</TableHead>
                            <TableHead>{t("Tổng tiền")}</TableHead>
                            <TableHead>{t("Thanh toán")}</TableHead>
                            <TableHead>{t("Trạng thái")}</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(view === "dashboard"
                            ? data.bills.slice(0, 5)
                            : data.bills
                        ).map((b) => (
                            <TableRow key={b.id}>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => setReceipt(b)}
                                    >
                                        #{b.id.slice(0, 8).toUpperCase()}
                                    </Button>
                                    <small>{b.customer}</small>
                                </TableCell>
                                <TableCell>
                                    {new Date(b.createdAt).toLocaleString(
                                        locales[language],
                                    )}
                                </TableCell>
                                <TableCell>
                                    <b>{money(b.total)}</b>
                                </TableCell>
                                <TableCell>
                                    {b.method === "demo"
                                        ? t("Online demo")
                                        : t("Tại quầy")}
                                </TableCell>
                                <TableCell>
                                    <select
                                        aria-label={t("Trạng thái hóa đơn")}
                                        disabled={busy}
                                        className={"status " + b.status}
                                        value={b.status}
                                        onChange={(e) =>
                                            admin({
                                                action: "status",
                                                id: b.id,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="pending">
                                            {t("Chờ thanh toán")}
                                        </option>
                                        <option value="paid">
                                            {t("Đã thanh toán")}
                                        </option>
                                        <option value="cancelled">
                                            {t("Đã hủy")}
                                        </option>
                                    </select>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={busy}
                                        className="text-destructive"
                                        aria-label={t("Xóa hóa đơn")}
                                        onClick={() => {
                                            if (confirm(t("Xóa hóa đơn này?")))
                                                admin({
                                                    action: "deleteBill",
                                                    id: b.id,
                                                });
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!data.bills.length && (
                    <div className="empty">
                        <ReceiptText size={36} />
                        <h3>{t("Chưa có hóa đơn nào")}</h3>
                        <p>
                            {t(
                                "Đặt đơn đầu tiên để bắt đầu theo dõi doanh thu.",
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
