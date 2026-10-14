import type { KitchenController } from "@/app/hooks/use-kitchen";
import { AppDialog } from "@junexa/ui/components/app-dialog";
import { AdminSettingsForm } from "./admin-settings-form";
import { ProductForm } from "./product-form";
type Props = Pick<KitchenController, "t" | "modal" | "setModal" | "edit" | "setEdit" | "busy" | "uploadImage" | "setToast" | "token" | "setToken" | "refresh" | "admin">;
export function ActionDialog(props: Props) {
    const { t, modal, setModal, busy } = props;
    return <AppDialog
        open={modal !== null}
        onOpenChange={(open) => { if (!open) setModal(null); }}
        busy={busy}
        title={modal === "product" ? t(props.edit.id ? "Chỉnh sửa món" : "Thêm món mới") : t("Cài đặt quản trị")}
        closeLabel={t("Đóng")}
    >
        {modal === "product" ? <ProductForm {...props} /> : <AdminSettingsForm {...props} />}
    </AppDialog>;
}
