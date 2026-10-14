import type { KitchenController } from "@/app/hooks/use-kitchen";
import { LanguageSelect } from "@junexa/shared/language-select";
import { ThemeToggle } from "@junexa/shared/theme-toggle";
import { nav } from "@junexa/shared/kitchen";
import { ChevronRight } from "lucide-react";
type AppHeaderProps = Pick<
    KitchenController,
    "language" | "t" | "changeLanguage" | "view"
>;
export function AppHeader({
    language,
    t,
    changeLanguage,
    view,
}: AppHeaderProps) {
    return (
        <header>
            <div className="breadcrumb">
                {t("Không gian làm việc")}
                <ChevronRight size={14} />
                <b>{t(nav.find((n) => n[0] === view)?.[1] || "")}</b>
            </div>
            <div className="header-right flex items-center">
                <ThemeToggle t={t} />
                <LanguageSelect language={language} changeLanguage={changeLanguage} />
                <span className="open-dot" />
                {t("Đang mở cửa")} <span className="header-divider" />
                <span className="tiny-avatar">J</span>
            </div>
        </header>
    );
}
