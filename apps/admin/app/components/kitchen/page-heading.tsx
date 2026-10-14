import type { KitchenController } from "@/app/hooks/use-kitchen";
import { Button } from "@junexa/ui/components/button";
import { emptyProduct } from "@junexa/shared/kitchen";
import { Plus } from "lucide-react";
type Props = Pick<KitchenController, "t" | "view" | "setModal" | "setEdit">;
export function PageHeading({ t, view, setModal, setEdit }: Props) {
    return <div className="page-heading">
        <div>
            <p className="eyebrow">JUNEXA ADMIN</p>
            <h1>{t(view === "dashboard" ? "Tổng quan kinh doanh" : view === "menu" ? "Quản lý thực đơn" : view === "finance" ? "Sao kê doanh thu" : "Hóa đơn của bạn")}</h1>
            <p>{t(view === "dashboard" ? "Mỗi đơn hàng, một câu chuyện. Cùng nhìn lại hoạt động của quán." : view === "menu" ? "Chăm chút từng món ngon trong thực đơn của bạn." : "Theo dõi đơn hàng và quản lý thanh toán tại một nơi.")}</p>
        </div>
        {view === "menu" && <Button type="button" onClick={() => { setEdit({ ...emptyProduct }); setModal("product"); }}>
            <Plus size={17} />{t("Thêm món mới")}
        </Button>}
    </div>;
}
