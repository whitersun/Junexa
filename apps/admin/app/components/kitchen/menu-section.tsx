import { Input } from "@junexa/ui/components/input";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import { categories } from "@junexa/shared/kitchen";
import { Heart, Leaf, Search } from "lucide-react";
import { ProductCard } from "./product-card";
type MenuSectionProps = Pick<
    KitchenController,
    | "t"
    | "productText"
    | "money"
    | "data"
    | "category"
    | "setCategory"
    | "search"
    | "setSearch"
    | "setModal"
    | "setEdit"
    | "loaded"
    | "admin"
    | "filtered"
>;
export function MenuSection({
    t,
    productText,
    money,
    data,
    category,
    setCategory,
    search,
    setSearch,
    setModal,
    setEdit,
    loaded,
    admin,
    filtered,
}: MenuSectionProps) {
    return (
        <>
            <div className="menu-title" id="menu-list">
                <h2>
                    {t("Danh sách món")}{" "}
                    <span>
                        {data.products.length} {t("món")}
                    </span>
                </h2>
                <label className="search">
                    <Search size={17} />
                    <Input className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" aria-label={t("Tìm món bạn yêu thích...")}
                        placeholder={t("Tìm món bạn yêu thích...")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <kbd>⌘ K</kbd>
                </label>
            </div>
            <div className="categories">
                {categories.map(([name, Icon]) => (
                    <button
                        key={t(name)}
                        className={category === name ? "selected" : ""}
                        onClick={() => setCategory(name)}
                    >
                        <Icon size={19} />
                        {t(name)}
                    </button>
                ))}
            </div>
            <div className="result-line">
                <span>
                    {category === "Tất cả" ? t("Tất cả món ngon") : t(category)}{" "}
                    <small>({filtered.length})</small>
                </span>
                <span>
                    <Leaf size={13} />
                    {t("Chế biến tươi khi bạn đặt")}
                </span>
            </div>
            <div className="product-grid">
                {filtered.map((p) => (
                    <ProductCard
                        key={p.id}
                        {...{
                            t,
                            productText,
                            money,
                            setModal,
                            setEdit,
                            admin,
                            p,
                        }}
                    />
                ))}
            </div>
            {!filtered.length && (
                <div className="empty">
                    {loaded
                        ? t("Không tìm thấy món phù hợp. Thử từ khóa khác nhé!")
                        : t("Đang chuẩn bị thực đơn...")}
                </div>
            )}
            <footer>
                <span>
                    {t("Được chuẩn bị bằng cả sự tận tâm")}
                    <Heart size={13} />
                </span>
                <span>Junexa Kitchen © 2026</span>
            </footer>
        </>
    );
}
