"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import { RevenueChart } from "./revenue-chart";
import { DashboardDetailsDialog, type DashboardDetail } from "./dashboard-details-dialog";
type DashboardSummaryProps = Pick<
    KitchenController,
    "t" | "language" | "money" | "data" | "paid" | "revenue" | "sold" | "soldItems" | "token"
>;
export function DashboardSummary({
    t,
    language,
    money,
    data,
    paid,
    revenue,
    sold,
    soldItems,
    token,
}: DashboardSummaryProps) {
    const [detail, setDetail] = useState<DashboardDetail | null>(null);
    const stats: { label: string; value: string | number; detail?: DashboardDetail }[] = [
        { label: "Doanh thu đã thanh toán", value: money(revenue) },
        { label: "Tổng đơn hàng", value: data.bills.length, detail: "orders" },
        { label: "Số món đã bán", value: sold, detail: "sold" },
        {
            label: "Món ăn / Đồ uống",
            value: `${data.products.filter((p) => p.category !== "Đồ uống").length} / ${data.products.filter((p) => p.category === "Đồ uống").length}`,
        },
    ];

    return (
        <>
            <div className="stats">
                {stats.map(({ label, value, detail: target }) => {
                    const content = <>
                        <span>{t(label)}</span>
                        <strong>{value}</strong>
                        <small className={target ? "flex items-center justify-between gap-2" : undefined}>
                            {t(target ? "Xem chi tiết" : "Dữ liệu thực tế từ đơn hàng")}
                            {target && <ChevronRight size={16} aria-hidden="true" />}
                        </small>
                    </>;

                    return target ? (
                        <button
                            type="button"
                            key={label}
                            className="stat min-w-0 cursor-pointer text-left transition-colors hover:border-brand hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none"
                            aria-haspopup="dialog"
                            onClick={() => setDetail(target)}
                        >
                            {content}
                        </button>
                    ) : <div className="stat" key={label}>{content}</div>;
                })}
            </div>
            <RevenueChart {...{ t, money, paid, revenue }} />
            {detail && <DashboardDetailsDialog
                {...{ detail, t, language, money, data, sold, soldItems, token }}
                onClose={() => setDetail(null)}
            />}
        </>
    );
}
