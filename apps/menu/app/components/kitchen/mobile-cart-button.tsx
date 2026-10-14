import type { MenuController } from "@/app/hooks/use-menu";
import { ShoppingBag } from "lucide-react";
type MobileCartButtonProps = Pick<
    MenuController,
    "t" | "money" | "setMobileCart" | "count" | "total"
>;
export function MobileCartButton({
    t,
    money,
    setMobileCart,
    count,
    total,
}: MobileCartButtonProps) {
    return (
        <button
            className="mobile-cart primary"
            onClick={() => setMobileCart(true)}
        >
            <ShoppingBag size={18} />
            {t("Giỏ hàng (")}
            {count}) · {money(total)}
        </button>
    );
}
