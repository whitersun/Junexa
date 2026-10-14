"use client";
import { useKitchenContext } from "./kitchen-provider";
import { ActionDialog } from "./action-dialog";
import { AppHeader } from "./app-header";
import { BillsPanel } from "./bills-panel";
import { DashboardSummary } from "./dashboard-summary";
import { MenuSection } from "./menu-section";
import { FinancePanel } from "./finance-panel";
import { PageHeading } from "./page-heading";
import { ReceiptDialog } from "./receipt-dialog";
import { Sidebar } from "./sidebar";
import { ToastNotification } from "./toast-notification";
export function KitchenApp() {
    const kitchen = useKitchenContext();
    const { view, toast, modal, receipt, loaded, refresh, setToast, t } = kitchen;
    return (
        <div className="app">
            <Sidebar {...kitchen} />
            <div className="body">
                <AppHeader {...kitchen} />
                <main className="admin-layout">
                    <section className="content">
                        <PageHeading {...kitchen} />
                        <div className="flex justify-end mb-4">
                            <button className="text-button" onClick={() => refresh().catch((e: Error) => setToast(e.message))}>
                                {t("Làm mới dữ liệu")}
                            </button>
                        </div>
                        {!loaded ? <p role="status">{t("Kết nối quản trị để xem dữ liệu cửa hàng.")}</p> : <>
                            {view === "menu" && <MenuSection {...kitchen} />}
                            {view === "finance" && <FinancePanel {...kitchen} />}
                            {view === "dashboard" && <DashboardSummary {...kitchen} />}
                            {(view === "bills" || view === "dashboard") && <BillsPanel {...kitchen} />}
                        </>}
                    </section>
                </main>
            </div>
            {toast && <ToastNotification {...kitchen} />}
            {modal && <ActionDialog {...kitchen} />}
            {receipt && <ReceiptDialog {...kitchen} />}
        </div>
    );
}
