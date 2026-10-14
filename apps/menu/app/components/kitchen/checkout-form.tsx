import { Button } from "@junexa/ui/components/button";
import { NativeSelect, NativeSelectOption } from "@junexa/ui/components/native-select";
import { Input } from "@junexa/ui/components/input";
import type { MenuController } from "@/app/hooks/use-menu";
import { ArrowRight } from "lucide-react";
type CheckoutFormProps = Pick<
    MenuController,
    | "t"
    | "money"
    | "customer"
    | "setCustomer"
    | "method"
    | "setMethod"
    | "busy"
    | "count"
    | "total"
    | "checkout"
>;
export function CheckoutForm({
    t,
    money,
    customer,
    setCustomer,
    method,
    setMethod,
    busy,
    count,
    total,
    checkout,
}: CheckoutFormProps) {
    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    checkout();
                }}
            >
                <label>
                    {t("Tên của bạn")}
                    <Input
                        required
                        maxLength={100}
                        placeholder={t("Nhập tên để nhận món")}
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                    />
                </label>
                <label>
                    {t("Phương thức thanh toán")}
                    <NativeSelect className="w-full"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        <NativeSelectOption value="demo">
                            {t("Thanh toán online — mô phỏng")}
                        </NativeSelectOption>
                        <NativeSelectOption value="cash">{t("Thanh toán tại quầy")}</NativeSelectOption>
                    </NativeSelect>
                </label>
                <div className="payment-note">
                    {method === "demo"
                        ? t(
                              "Chế độ demo: xác nhận sẽ mô phỏng giao dịch thành công. Không thu tiền thật.",
                          )
                        : t("Bạn có thể thanh toán khi nhận món tại quầy.")}
                </div>
                <div className="sum-total flex items-center justify-between">
                    <b>
                        {count} {t("món · Bàn 01")}
                    </b>
                    <strong>{money(total)}</strong>
                </div>
                <Button type="submit" disabled={busy} className="w-full h-12 justify-between">
                    {busy
                        ? t("Đang xử lý...")
                        : method === "demo"
                          ? t("Thanh toán demo")
                          : t("Đặt món ngay")}
                    <ArrowRight size={17} />
                </Button>
            </form>
        </>
    );
}
