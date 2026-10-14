import type { MenuController } from "@/app/hooks/use-menu";
import { ArrowUpRight, Leaf } from "lucide-react";
import Image from "next/image";
type MenuHeroProps = Pick<MenuController, "t" | "setCategory">;
export function MenuHero({ t, setCategory }: MenuHeroProps) {
    return (
        <div className="hero">
            <div className="hero-text">
                <span className="hero-pill">
                    <span />
                    {t("TƯƠI NGON MỖI NGÀY")}
                </span>
                <h2>
                    {t("Ăn ngon một chút.")}
                    <br />
                    {t("Vui hơn cả ngày.")}
                </h2>
                <p>
                    {t("Nguyên liệu tươi, hương vị thật.")}
                    <br />
                    {t("Từ căn bếp Junexa đến bàn của bạn.")}
                </p>
                <button
                    onClick={() => {
                        setCategory("Món chính");
                        document.getElementById("menu-list")?.scrollIntoView({
                            behavior: "smooth",
                        });
                    }}
                >
                    {t("Khám phá thực đơn")}
                    <ArrowUpRight size={17} />
                </button>
            </div>
            <div className="hero-image">
                <Image
                    unoptimized
                    src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=90"
                    alt={t("Tô salad tươi ngon")}
                    fill
                    sizes="45vw"
                    priority
                />
                <span className="hero-note">
                    <Leaf size={17} />
                    {t("100% nguyên liệu tươi")}
                </span>
            </div>
            <span className="hero-deco">✳</span>
        </div>
    );
}
