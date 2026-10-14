"use client";

import { useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@junexa/ui/components/dialog";
import { Button } from "@junexa/ui/components/button";
import { locales } from "@junexa/shared/i18n";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import { useBillPages } from "@/app/hooks/use-bill-pages";
import { DashboardOrdersList } from "./dashboard-orders-list";

export type DashboardDetail = "orders" | "sold";

type DashboardDetailsDialogProps = Pick<
    KitchenController,
    "t" | "language" | "money" | "data" | "sold" | "soldItems" | "token"
> & {
    detail: DashboardDetail;
    onClose: () => void;
};

export function DashboardDetailsDialog({
    detail,
    onClose,
    t,
    language,
    money,
    data,
    sold,
    soldItems,
    token,
}: DashboardDetailsDialogProps) {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const isOrders = detail === "orders";
    const orders = useBillPages(token, isOrders, data.bills);
    const selectedOrder = orders.bills.find((bill) => bill.id === selectedOrderId);
    const number = (value: number) => value.toLocaleString(locales[language]);
    const statusText = (status: KitchenController["data"]["bills"][number]["status"]) =>
        t(status === "paid" ? "Đã thanh toán" : status === "pending" ? "Chờ thanh toán" : "Đã hủy");

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-xl p-0 text-base sm:max-w-2xl"
                onOpenAutoFocus={() => {
                    const active = document.activeElement;
                    if (active instanceof HTMLElement && active !== document.body) returnFocus.current = active;
                }}
                onCloseAutoFocus={(event) => {
                    if (returnFocus.current?.isConnected) {
                        event.preventDefault();
                        returnFocus.current.focus();
                    }
                }}
            >
                <DialogHeader className="shrink-0 gap-2 border-b border-border px-6 py-5 pr-16 sm:px-7 sm:pr-16">
                    <DialogTitle className="m-0 text-xl leading-snug font-semibold">
                        {t(selectedOrder ? "Chi tiết đơn hàng" : isOrders ? "Tổng đơn hàng" : "Số món đã bán")}
                    </DialogTitle>
                    <DialogDescription className="m-0 text-sm leading-relaxed break-words">
                        {selectedOrder
                            ? `#${selectedOrder.id} · ${selectedOrder.customer}`
                            : t(isOrders
                                ? "Bao gồm tất cả đơn hàng, kể cả đơn đã hủy và đơn demo."
                                : "Chỉ tính số lượng món trong đơn đã thanh toán, không bao gồm đơn demo.")}
                    </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label={t("Đóng")} className="absolute top-3 right-3">
                        <X className="size-5" aria-hidden="true" />
                    </Button>
                </DialogClose>
                <div data-dialog-scroll="" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7">
                    {selectedOrder ? (
                        <div>
                            <Button
                                type="button"
                                variant="ghost"
                                autoFocus
                                className="mb-4 -ml-3"
                                onClick={() => setSelectedOrderId(null)}
                            >
                                <ArrowLeft aria-hidden="true" />
                                {t("Danh sách đơn hàng")}
                            </Button>
                            <div className="mb-5 rounded-xl bg-muted p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <strong>#{selectedOrder.id.slice(0, 8).toUpperCase()}</strong>
                                    <span className={`status ${selectedOrder.status}`}>{statusText(selectedOrder.status)}</span>
                                </div>
                                <p className="mt-3 mb-0 text-sm text-muted-foreground">
                                    <time dateTime={selectedOrder.createdAt}>
                                        {new Date(selectedOrder.createdAt).toLocaleString(locales[language])}
                                    </time>
                                </p>
                                <p className="mt-1 mb-0 text-sm text-muted-foreground">
                                    {t("Phương thức thanh toán")}: {t(selectedOrder.method === "demo" ? "Online demo" : "Tại quầy")}
                                </p>
                            </div>
                            <ul className="m-0 list-none divide-y divide-border p-0">
                                {selectedOrder.items.map((item, index) => (
                                    <li key={`${item.productId}-${index}`} className="flex flex-wrap items-start justify-between gap-3 py-4">
                                        <div className="min-w-0 flex-1 basis-40">
                                            <p className="m-0 break-words font-medium">
                                                {item.translations?.[language as "en" | "zh-TW"]?.name?.trim() || t(item.name)}
                                            </p>
                                            <p className="mt-1 mb-0 text-sm text-muted-foreground">
                                                {number(item.quantity)} × {money(item.price)}
                                            </p>
                                        </div>
                                        <strong className="tabular-nums">{money(item.quantity * item.price)}</strong>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                <strong>{t("Tổng tiền")}</strong>
                                <strong className="text-xl tabular-nums">{money(selectedOrder.total)}</strong>
                            </div>
                        </div>
                    ) : <>
                        <div className="mb-5 rounded-xl bg-muted p-4">
                            <p className="m-0 flex items-baseline gap-2">
                                <strong className="text-3xl font-semibold tabular-nums">
                                    {number(isOrders ? orders.page?.totalOrders ?? data.bills.length : sold)}
                                </strong>
                                <span className="text-muted-foreground">{t(isOrders ? "đơn" : "món")}</span>
                            </p>
                        </div>
                        {isOrders ? (
                            <DashboardOrdersList
                                {...{ t, language, money, orders, lastOrderId }}
                                onSelect={(bill) => {
                                    setLastOrderId(bill.id);
                                    setSelectedOrderId(bill.id);
                                }}
                            />
                        ) : (
                            soldItems.length ? (
                                <div>
                                    <div className="flex justify-between gap-4 border-b border-border pb-3 text-sm text-muted-foreground">
                                        <span>{t("Món đã bán")}</span>
                                        <span>{t("Số lượng")}</span>
                                    </div>
                                    <ul className="m-0 list-none divide-y divide-border p-0" aria-label={t("Món đã bán")}>
                                        {soldItems.map((item) => (
                                            <li key={item.productId} className="flex items-start justify-between gap-4 py-4">
                                                <span className="min-w-0 break-words">
                                                    {item.translations?.[language as "en" | "zh-TW"]?.name?.trim() || t(item.name)}
                                                </span>
                                                <strong className="shrink-0 tabular-nums">{number(item.quantity)}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : <p className="py-6 text-center text-muted-foreground">{t("Chưa có món nào được bán.")}</p>
                        )}
                    </>}
                </div>
                <DialogFooter className="m-0 shrink-0 flex-row justify-end rounded-none border-t border-border bg-muted/30 px-6 py-3 sm:px-7">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="min-w-24">{t("Đóng")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
