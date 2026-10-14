import type { KitchenController } from "@/app/hooks/use-kitchen";
import { nav } from "@junexa/shared/kitchen";
import { ChevronRight, Coffee, Settings, UtensilsCrossed } from "lucide-react";
type SidebarProps = Pick<
    KitchenController,
    "t" | "view" | "setView" | "setCategory" | "setSearch" | "setModal"
>;
export function Sidebar({
    t,
    view,
    setView,
    setCategory,
    setSearch,
    setModal,
}: SidebarProps) {
    return (
        <aside className="sidebar">
            <a className="brand" href="/">
                <span className="brand-icon">
                    <UtensilsCrossed size={23} />
                </span>
                junexa<span className="brand-dot">.</span>
            </a>
            <div className="workspace">
                <span className="store-icon">J</span>
                <div>
                    <b>Junexa Kitchen</b>
                    <small>{t("Không gian của bạn")}</small>
                </div>
                <ChevronRight size={15} />
            </div>
            <p className="nav-label">{t("KHÔNG GIAN LÀM VIỆC")}</p>
            <nav>
                {nav.map(([id, label, Icon]) => (
                    <button
                        key={id}
                        className={view === id ? "nav-item active" : "nav-item"}
                        onClick={() => {
                            setView(id);
                            setSearch("");
                            setCategory("Tất cả");
                        }}
                    >
                        <Icon size={19} />
                        {t(String(label))}
                    </button>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <div className="help-card">
                    <span>{t("✦ Một ngày thật ngon")}</span>
                    <p>
                        {t("Món ngon sẵn sàng.")}
                        <br />
                        {t("Niềm vui đang chờ bạn!")}
                    </p>
                    <Coffee size={36} />
                </div>
                <button
                    className="nav-item"
                    onClick={() => setModal("settings")}
                >
                    <Settings size={19} />
                    {t("Cài đặt")}
                </button>
                <div className="profile">
                    <div className="avatar">JA</div>
                    <div>
                        <b>Junexa Admin</b>
                        <small>{t("Quản trị viên")}</small>
                    </div>
                    <span className="online" />
                </div>
            </div>
        </aside>
    );
}
