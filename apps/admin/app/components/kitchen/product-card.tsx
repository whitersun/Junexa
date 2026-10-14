import type { KitchenController } from "@/app/hooks/use-kitchen";
import { Button } from "@junexa/ui/components/button";
import type { Product } from "@junexa/shared/data";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
type Props = Pick<KitchenController, "t" | "productText" | "money" | "setModal" | "setEdit" | "admin"> & { p: Product };
export function ProductCard({ t, productText, money, setModal, setEdit, admin, p }: Props) {
    return <article className="product">
        <div className="product-image">
            <Image unoptimized src={p.image} fill sizes="(max-width:700px) 45vw, 25vw" alt={productText(p, "name")} />
            {p.badge && <span className="badge">{t(p.badge)}</span>}
            <span className="image-category">{t(p.category)}</span>
        </div>
        <div className="product-info">
            <div className="product-name"><h3>{productText(p, "name")}</h3></div>
            <p>{productText(p, "description")}</p>
            {!p.available && <p>{t("Hết món")}</p>}
            <div className="product-bottom flex items-center justify-between">
                <strong>{money(p.price)}</strong>
                <div className="edit-actions flex">
                    <Button type="button" variant="secondary" size="icon" aria-label={t("Sửa ") + productText(p, "name")} onClick={() => { setEdit({ ...p }); setModal("product"); }}><Pencil size={16} /></Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" aria-label={t("Xóa ") + productText(p, "name")} onClick={() => { if (confirm(t("Xóa món ") + productText(p, "name") + "?")) admin({ action: "deleteProduct", id: p.id }); }}><Trash2 size={16} /></Button>
                </div>
            </div>
        </div>
    </article>;
}
