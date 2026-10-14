"use client";
import { useMenu } from "@/app/hooks/use-menu";
import { LanguageSelect } from "@junexa/shared/language-select";
import { AppDialog } from "@junexa/ui/components/app-dialog";
import { Button } from "@junexa/ui/components/button";
import { ThemeToggle } from "@junexa/shared/theme-toggle";
import { UtensilsCrossed } from "lucide-react";
import { MenuHero } from "./menu-hero";
import { MenuSection } from "./menu-section";
import { OrderCart } from "./order-cart";
import { MobileCartButton } from "./mobile-cart-button";
import { CheckoutForm } from "./checkout-form";
import { ReceiptDialog } from "./receipt-dialog";
import { ToastNotification } from "./toast-notification";
export function MenuApp() {
    const menu = useMenu();
    const { t, language, changeLanguage, modal, setModal, busy, toast, receipt, error, refresh } = menu;
    return <div className="min-h-screen">
        <header>
            <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="Junexa">
                <UtensilsCrossed size={24} className="text-brand" />junexa<span className="text-brand">.</span>
            </a>
            <div className="flex items-center gap-2">
                <ThemeToggle t={t} />
                <LanguageSelect language={language} changeLanguage={changeLanguage} />
            </div>
        </header>
        <main className="order-layout">
            <section className="content">
                <div className="page-heading"><div>
                    <p className="eyebrow">{t("FRESH FOOD, GOOD MOOD")}</p>
                    <h1>{t("Hôm nay, ăn gì nhỉ?")} <span>✨</span></h1>
                    <p>{t("Một chút ngon, một ngày vui. Chọn món yêu thích của bạn nhé!")}</p>
                </div></div>
                <MenuHero {...menu} />
                {error ? <div role="alert" className="empty"><p>{t(error)}</p><Button onClick={() => void refresh()}>{t("Thử lại")}</Button></div> : <MenuSection {...menu} />}
            </section>
            <OrderCart {...menu} />
        </main>
        <MobileCartButton {...menu} />
        {toast && <ToastNotification {...menu} />}
        <AppDialog open={modal === "checkout"} onOpenChange={(open) => { if (!open) setModal(null); }} busy={busy} title={t("Hoàn tất đơn hàng")} eyebrow={t("SẮP CÓ MÓN NGON RỒI")} closeLabel={t("Đóng")}>
            <CheckoutForm {...menu} />
        </AppDialog>
        {receipt && <ReceiptDialog {...menu} />}
    </div>;
}
