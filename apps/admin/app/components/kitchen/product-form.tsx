import { Button } from "@junexa/ui/components/button";
import { NativeSelect, NativeSelectOption } from "@junexa/ui/components/native-select";
import { Input } from "@junexa/ui/components/input";
import type { KitchenController } from "@/app/hooks/use-kitchen";
import { categories } from "@junexa/shared/kitchen";
import { Upload } from "lucide-react";
import { ProductTranslations } from "./product-translations";
type ProductFormProps = Pick<
    KitchenController,
    "t" | "edit" | "setEdit" | "busy" | "uploadImage" | "admin"
>;
export function ProductForm({
    t,
    edit,
    setEdit,
    busy,
    uploadImage,
    admin,
}: ProductFormProps) {
    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    admin({
                        action: "saveProduct",
                        product: edit,
                    });
                }}
            >
                <label>
                    {t("Tên món")}
                    <Input
                        required
                        value={edit.name}
                        onChange={(e) =>
                            setEdit({
                                ...edit,
                                name: e.target.value,
                            })
                        }
                    />
                </label>
                <ProductTranslations edit={edit} setEdit={setEdit} />
                <div className="form-row flex">
                    <label>
                        {t("Giá (VND)")}
                        <Input
                            type="number"
                            required
                            min="1000"
                            step="1000"
                            value={edit.price}
                            onChange={(e) =>
                                setEdit({
                                    ...edit,
                                    price: Number(e.target.value),
                                })
                            }
                        />
                    </label>
                    <label>
                        {t("Danh mục")}
                        <NativeSelect className="w-full"
                            value={edit.category}
                            onChange={(e) =>
                                setEdit({
                                    ...edit,
                                    category: e.target.value,
                                })
                            }
                        >
                            {categories.slice(1).map(([c]) => (
                                <NativeSelectOption key={c} value={c}>
                                    {t(c)}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </label>
                </div>
                <label>
                    {t("Mô tả")}
                    <Input
                        value={edit.description}
                        onChange={(e) =>
                            setEdit({
                                ...edit,
                                description: e.target.value,
                            })
                        }
                    />
                </label>
                <label>
                    {t("URL hình ảnh")}
                    <Input
                        type="url"
                        required
                        value={edit.image}
                        onChange={(e) =>
                            setEdit({
                                ...edit,
                                image: e.target.value,
                            })
                        }
                    />
                </label>
                <label className="upload">
                    <Upload size={16} />
                    {t("Tải ảnh lên")}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadImage(file);
                        }}
                    />
                </label>
                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={edit.available}
                        onChange={(e) =>
                            setEdit({
                                ...edit,
                                available: e.target.checked,
                            })
                        }
                    />
                    {t("Đang bán")}
                </label>
                <Button type="submit" disabled={busy} className="w-full h-12 justify-between">
                    {busy ? t("Đang lưu...") : t("Lưu món")}
                </Button>
            </form>
        </>
    );
}
