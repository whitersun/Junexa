import { Button } from "@junexa/ui/components/button";
import { Input } from "@junexa/ui/components/input";
import type { KitchenController } from "@/app/hooks/use-kitchen";
type AdminSettingsFormProps = Pick<
    KitchenController,
    "t" | "setModal" | "setToast" | "token" | "setToken" | "refresh"
>;
export function AdminSettingsForm({
    t,
    setModal,
    setToast,
    token,
    setToken,
    refresh,
}: AdminSettingsFormProps) {
    return (
        <>
            <p>
                {t(
                    "Nhập mã ADMIN_TOKEN đã cấu hình trên server để quản lý dữ liệu. Bản local không cấu hình mã sẽ mở chế độ demo.",
                )}
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    refresh()
                        .then(() => {
                            setModal(null);
                            setToast("Đã tải dữ liệu quản trị");
                        })
                        .catch((e) => setToast(e.message));
                }}
            >
                <label>
                    {t("Mã quản trị")}
                    <Input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </label>
                <Button type="submit" className="w-full h-12 justify-between">{t("Kết nối")}</Button>
            </form>
        </>
    );
}
