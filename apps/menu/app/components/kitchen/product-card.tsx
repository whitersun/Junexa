import type { MenuController } from "@/app/hooks/use-menu";
import { Button } from "@junexa/ui/components/button";
import type { Product } from "@junexa/shared/data";
import { Check, Plus } from "lucide-react";
import Image from "next/image";
type Props = Pick<MenuController, "t" | "productText" | "money" | "cart" | "add"> & { p: Product };
export function ProductCard({ t, productText, money, cart, add, p }: Props) {
    return <article className="product">
        <div className="product-image">
            <Image unoptimized src={p.image} fill sizes="(max-width:700px) 45vw, 25vw" alt={productText(p, "name")} />
            {p.badge && <span className="badge">{t(p.badge)}</span>}
            <span className="image-category">{t(p.category)}</span>
        </div>
        <div className="product-info">
            <div className="product-name"><h3>{productText(p, "name")}</h3></div>
            <p>{productText(p, "description")}</p>
            <div className="product-bottom flex items-center justify-between">
                <strong>{money(p.price)}</strong>
                <Button type="button" variant="secondary" aria-label={t("Thêm ") + productText(p, "name")} className="h-11 min-w-11 bg-accent px-3 text-brand hover:bg-primary hover:text-primary-foreground" disabled={!p.available} onClick={() => add(p.id)}>
                    {!p.available ? t("Hết món") : cart[p.id] ? <><Check size={16} />{cart[p.id]}</> : <Plus size={20} />}
                </Button>
            </div>
        </div>
    </article>;
}
