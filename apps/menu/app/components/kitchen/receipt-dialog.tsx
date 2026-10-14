import { AppDialog } from "@junexa/ui/components/app-dialog";
import { Button } from "@junexa/ui/components/button";
import type { MenuController } from "@/app/hooks/use-menu";
import { Check } from "lucide-react";
type ReceiptDialogProps = Pick<
    MenuController,
    "language" | "t" | "money" | "receipt" | "setReceipt"
>;
export function ReceiptDialog({
    language,
    t,
    money,
    receipt,
    setReceipt,
}: ReceiptDialogProps) {
    if (!receipt) return null;
    return (
        <AppDialog open={Boolean(receipt)} onOpenChange={(open) => { if (!open) setReceipt(null); }} title={receipt.status === "paid" ? t("Thanh toán thành công!") : t("Chi tiết đơn hàng")} closeLabel={t("Đóng")} className="receipt">
                <div className="success-icon">
                    <Check />
                </div>
                <p>
                    #{receipt.id.slice(0, 8).toUpperCase()} · {receipt.customer}
                </p>
                {receipt.items.map((i, index) => (
                    <div className="sum-row flex justify-between" key={index}>
                        <span>
                            {i.quantity} ×{" "}
                            {i.translations?.[
                                language as "en" | "zh-TW"
                            ]?.name?.trim() || t(i.name)}
                        </span>
                        <b>{money(i.price * i.quantity)}</b>
                    </div>
                ))}
                <div className="sum-total flex items-center justify-between">
                    <b>{t("Tổng tiền")}</b>
                    <strong>{money(receipt.total)}</strong>
                </div>
                <p>
                    {receipt.status === "paid"
                        ? t("Đã thanh toán")
                        : receipt.status === "cancelled"
                          ? t("Đã hủy")
                          : t("Chờ thanh toán")}{" "}
                    ·{" "}
                    {receipt.method === "demo"
                        ? t("Giao dịch mô phỏng")
                        : t("Tại quầy")}
                </p>
                <Button type="button"
                    className="mt-4 h-12 w-full"
                    onClick={() => setReceipt(null)}
                >
                    {t("Tiếp tục khám phá")}
                </Button>
        </AppDialog>
    );
}
