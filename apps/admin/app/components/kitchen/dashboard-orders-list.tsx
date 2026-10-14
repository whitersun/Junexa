"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@junexa/ui/components/button";
import { Input } from "@junexa/ui/components/input";
import { locales } from "@junexa/shared/i18n";
import type { Bill } from "@junexa/shared/data";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import type { useBillPages } from "@/app/hooks/use-bill-pages";

type Props = Pick<KitchenController, "t" | "language" | "money"> & {
    orders: ReturnType<typeof useBillPages>;
    lastOrderId: string | null;
    onSelect: (bill: Bill) => void;
};

export function DashboardOrdersList({ t, language, money, orders, lastOrderId, onSelect }: Props) {
    const sentinel = useRef<HTMLDivElement>(null);
    const returnTarget = useRef<HTMLButtonElement>(null);
    const { search, setSearch, bills, page, loading, error, loadMore } = orders;
    const nextCursor = page?.nextCursor;

    useEffect(() => { returnTarget.current?.focus(); }, []);

    useEffect(() => {
        const target = sentinel.current;
        if (!target || loading || error || !nextCursor || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) loadMore();
        }, {
            root: target.closest("[data-dialog-scroll]"),
            rootMargin: "0px 0px 240px 0px",
        });
        observer.observe(target);
        return () => observer.disconnect();
    }, [loading, error, nextCursor, loadMore]);

    return (
        <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="dashboard-bill-search">{t("Tìm theo bill ID")}</label>
            <Input
                id="dashboard-bill-search"
                type="search"
                autoComplete="off"
                maxLength={128}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Nhập bill ID...")}
            />
            {search.trim() && page && <p className="mt-3 mb-0 text-sm text-muted-foreground" role="status">
                {t("Kết quả tìm kiếm")}: {page.total.toLocaleString(locales[language])} {t("đơn")}
            </p>}
            <ul className="m-0 mt-2 list-none divide-y divide-border p-0" aria-label={t("Danh sách đơn hàng")} aria-busy={loading}>
                {bills.map((bill) => (
                    <li key={bill.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                        <div className="min-w-0 flex-1 basis-40">
                            <Button
                                type="button"
                                variant="link"
                                className="-my-2 min-h-11 max-w-full justify-start px-0 font-semibold"
                                ref={bill.id === lastOrderId ? returnTarget : undefined}
                                aria-label={`${t("Chi tiết đơn hàng")} #${bill.id}`}
                                title={bill.id}
                                onClick={() => onSelect(bill)}
                            >
                                #{bill.id.slice(0, 8).toUpperCase()}
                                <ChevronRight aria-hidden="true" />
                            </Button>
                            <p className="mt-1 mb-0 break-words text-sm">{bill.customer}</p>
                            <p className="mt-1 mb-0 text-sm text-muted-foreground">
                                <time dateTime={bill.createdAt}>{new Date(bill.createdAt).toLocaleString(locales[language])}</time>
                                {bill.method === "demo" && <> · {t("Online demo")}</>}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <strong className="tabular-nums">{money(bill.total)}</strong>
                            <span className={`status ${bill.status}`}>
                                {t(bill.status === "paid" ? "Đã thanh toán" : bill.status === "pending" ? "Chờ thanh toán" : "Đã hủy")}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            {!loading && !error && !bills.length && <p className="py-6 text-center text-muted-foreground">
                {t(search.trim() ? "Không tìm thấy đơn hàng phù hợp." : "Chưa có hóa đơn nào")}
            </p>}
            <div ref={sentinel} className="flex min-h-12 flex-col items-center justify-center gap-2 py-3">
                {loading ? <p className="m-0 flex items-center gap-2 text-sm text-muted-foreground" role="status">
                    <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
                    {t("Đang tải đơn hàng...")}
                </p> : error ? <>
                    <p className="m-0 text-sm text-destructive" role="alert">{t("Không thể tải đơn hàng.")}</p>
                    <Button type="button" variant="outline" onClick={loadMore}>{t("Thử lại")}</Button>
                </> : nextCursor ? (
                    <Button type="button" variant="ghost" onClick={loadMore}>{t("Tải thêm đơn hàng")}</Button>
                ) : bills.length ? <p className="m-0 text-sm text-muted-foreground">{t("Đã hiển thị tất cả đơn hàng.")}</p> : null}
            </div>
        </div>
    );
}
