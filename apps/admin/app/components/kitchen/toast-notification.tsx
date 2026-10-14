import type { KitchenController } from "@/app/hooks/use-kitchen";
import { X } from "lucide-react";
type ToastNotificationProps = Pick<
    KitchenController,
    "t" | "toast" | "setToast"
>;
export function ToastNotification({
    t,
    toast,
    setToast,
}: ToastNotificationProps) {
    return (
        <div role="status" className="toast">
            {t(toast)}
            <button
                onClick={() => setToast("")}
                aria-label={t("Đóng thông báo")}
            >
                <X size={16} />
            </button>
        </div>
    );
}
