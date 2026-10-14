import type { KitchenController } from "@/app/hooks/use-kitchen";
type RevenueChartProps = Pick<
    KitchenController,
    "t" | "money" | "paid" | "revenue"
>;
export function RevenueChart({ t, money, paid, revenue }: RevenueChartProps) {
    return (
        <div className="chart-card">
            <h2>{t("Doanh thu 7 ngày gần đây")}</h2>
            <p>{t("Chỉ bao gồm hóa đơn đã thu tại quầy")}</p>
            <div className="chart">
                {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - 6 + i);
                    const amount = paid
                        .filter(
                            (b) =>
                                new Date(b.createdAt).toDateString() ===
                                date.toDateString(),
                        )
                        .reduce((n, b) => n + b.total, 0);
                    return (
                        <div className="bar-col" key={i}>
                            <span>{money(amount)}</span>
                            <div
                                className="bar"
                                style={{
                                    height: Math.max(
                                        3,
                                        (amount / Math.max(revenue, 1)) * 170,
                                    ),
                                }}
                            />
                            <small>
                                {date.getDate()}/{date.getMonth() + 1}
                            </small>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
