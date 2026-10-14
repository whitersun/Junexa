import { Input } from "@junexa/ui/components/input";
import type { KitchenController } from "@/app/hooks/use-kitchen";
type Props = Pick<KitchenController, "edit" | "setEdit">;
export function ProductTranslations({ edit, setEdit }: Props) {
    return (
        <details className="translation-fields">
            <summary>English / 繁體中文</summary>
            {(["en", "zh-TW"] as const).map((code) => (
                <div key={code}>
                    <label>
                        {code === "en"
                            ? "Dish name (English)"
                            : "餐點名稱（繁體中文）"}
                        <Input
                            value={edit.translations?.[code]?.name || ""}
                            onChange={(e) =>
                                setEdit({
                                    ...edit,
                                    translations: {
                                        ...edit.translations,
                                        [code]: {
                                            ...edit.translations?.[code],
                                            name: e.target.value,
                                        },
                                    },
                                })
                            }
                        />
                    </label>
                    <label>
                        {code === "en"
                            ? "Description (English)"
                            : "說明（繁體中文）"}
                        <Input
                            value={edit.translations?.[code]?.description || ""}
                            onChange={(e) =>
                                setEdit({
                                    ...edit,
                                    translations: {
                                        ...edit.translations,
                                        [code]: {
                                            ...edit.translations?.[code],
                                            description: e.target.value,
                                        },
                                    },
                                })
                            }
                        />
                    </label>
                </div>
            ))}
        </details>
    );
}
