import type { MenuController } from "@/app/hooks/use-menu";
import { Button } from "@junexa/ui/components/button";
import {
    ArrowRight,
    Check,
    ChefHat,
    Minus,
    Plus,
    ShoppingBag,
    UtensilsCrossed,
    X,
} from "lucide-react";
import Image from "next/image";
type OrderCartProps = Pick<
    MenuController,
    | "t"
    | "productText"
    | "money"
    | "cart"
    | "setCart"
    | "setModal"
    | "mobileCart"
    | "setMobileCart"
    | "cartItems"
    | "count"
    | "total"
    | "add"
>;
export function OrderCart({
    t,
    productText,
    money,
    cart,
    setCart,
    setModal,
    mobileCart,
    setMobileCart,
    cartItems,
    count,
    total,
    add,
}: OrderCartProps) {
    return (
        <aside className={"cart " + (mobileCart ? "mobile-open" : "")}>
            <div className="cart-heading flex items-center justify-between">
                <h2>
                    {t("Đơn hàng của bạn")}
                    <span>{count}</span>
                </h2>
                <button
                    className="mobile-close icon-button"
                    onClick={() => setMobileCart(false)}
                    aria-label={t("Đóng giỏ")}
                >
                    <X />
                </button>
            </div>
            <div className="dine-in">
                <span>
                    <UtensilsCrossed size={16} />
                    {t("Dùng tại quán")}
                </span>
                <span>{t("Bàn 01")}</span>
            </div>
            <div className="cart-items">
                {!cartItems.length ? (
                    <div className="cart-empty">
                        <div className="bag-circle">
                            <ShoppingBag size={36} strokeWidth={1.3} />
                            <span>+</span>
                        </div>
                        <h3>{t("Món ngon đang chờ bạn")}</h3>
                        <p>
                            {t("Thêm món yêu thích vào giỏ")}
                            <br />
                            {t("để bắt đầu một bữa ăn thật ngon.")}
                        </p>
                        <span className="hand-arrow">↖</span>
                    </div>
                ) : (
                    cartItems.map((p) => (
                        <div className="cart-item" key={p.id}>
                            <Image
                                unoptimized
                                src={p.image}
                                width={57}
                                height={57}
                                alt={productText(p, "name")}
                            />
                            <div>
                                <h4>{productText(p, "name")}</h4>
                                <b>{money(p.price)}</b>
                                <div className="quantity flex items-center">
                                    <button
                                        aria-label={
                                            t("Giảm ") + productText(p, "name")
                                        }
                                        onClick={() => add(p.id, -1)}
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span>{cart[p.id]}</span>
                                    <button
                                        aria-label={
                                            t("Tăng ") + productText(p, "name")
                                        }
                                        onClick={() => add(p.id)}
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>
                            <button
                                className="remove"
                                aria-label={t("Bỏ ") + productText(p, "name")}
                                onClick={() =>
                                    setCart((c) => ({
                                        ...c,
                                        [p.id]: 0,
                                    }))
                                }
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="cart-summary">
                <div className="order-note">
                    <ChefHat size={18} />
                    <p>
                        {t("Món ngon được chuẩn bị ngay")}
                        <br />
                        {t("sau khi bạn xác nhận đơn.")}
                    </p>
                </div>
                <div className="sum-row flex justify-between">
                    <span>{t("Tạm tính")}</span>
                    <b>{money(total)}</b>
                </div>
                <div className="sum-row flex justify-between">
                    <span>{t("Phí dịch vụ")}</span>
                    <span className="green">{t("Miễn phí")}</span>
                </div>
                <div className="sum-total flex items-center justify-between">
                    <b>{t("Tổng thanh toán")}</b>
                    <strong>{money(total)}</strong>
                </div>
                <Button
                    type="button"
                    className="h-12 w-full justify-between disabled:bg-[var(--accent-disabled)]"
                    disabled={!count}
                    onClick={() => setModal("checkout")}
                >
                    {t("Xác nhận đơn hàng")}
                    <ArrowRight size={18} />
                </Button>
                <p className="secure">
                    <Check size={12} />
                    {t("Thanh toán an toàn · Đặt món dễ dàng")}
                </p>
            </div>
        </aside>
    );
}
