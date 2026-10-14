"use client";
import type { Bill, Product, Store } from "@junexa/shared/data";
import { locales } from "@junexa/shared/i18n";
import { emptyProduct } from "@junexa/shared/kitchen";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { viewFromPath, viewRoutes, type KitchenView } from "@/lib/routes";
import { summarizeSoldItems } from "@/lib/dashboard-sales";
import { useLanguage } from "./use-language";
export function useKitchen() {
    const { language, t, productText, money, changeLanguage } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const view = viewFromPath(pathname);
    function setView(nextView: KitchenView) {
        setModal(null);
        router.push(viewRoutes[nextView]);
    }
    const [data, setData] = useState<Store>({ products: [], bills: [] }),
        [category, setCategory] = useState("Tất cả"),
        [search, setSearch] = useState(""),
        [modal, setModal] = useState<
            "product" | "settings" | null
        >(null),
        [edit, setEdit] = useState<Product>(emptyProduct),
        [busy, setBusy] = useState(false),
        [toast, setToast] = useState(""),
        [token, setToken] = useState(""),
        [receipt, setReceipt] = useState<Bill | null>(null),
        [loaded, setLoaded] = useState(false);
    async function refresh(t = token) {
        const r = await fetch("/api/store", {
            headers: { authorization: `Bearer ${t}` },
        });
        const d = await r.json();
        if (!r.ok) {
            setData({ products: [], bills: [] });
            setLoaded(false);
            if (r.status === 401) setModal("settings");
            throw Error(d.error);
        }
        setData(d);
        setLoaded(true);
    }
    useEffect(() => {
        refresh().catch((e) => setToast(e.message));
    }, []);
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(""), 4500);
            return () => clearTimeout(t);
        }
    }, [toast]);
    async function admin(body: unknown) {
        setBusy(true);
        try {
            const r = await fetch("/api/store", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const d = await r.json();
            if (!r.ok) throw Error(d.error);
            await refresh();
            setModal(null);
            setToast("Đã lưu thay đổi");
        } catch (e) {
            setToast((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    async function uploadImage(file: File) {
        setBusy(true);
        try {
            const form = new FormData();
            form.set("file", file);
            const r = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    authorization: `Bearer ${token}`,
                },
                body: form,
            });
            const d = await r.json();
            if (!r.ok) throw Error(d.error);
            setEdit((p) => ({
                ...p,
                image: d.url,
            }));
        } catch (e) {
            setToast((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    const filtered = data.products.filter(
        (p) =>
            (category === "Tất cả" || p.category === category) &&
            [p.name, productText(p, "name")].some((name) =>
                name
                    .toLocaleLowerCase(locales[language])
                    .includes(search.toLocaleLowerCase(locales[language])),
            ),
    );
    const paid = data.bills.filter((b) => b.status === "paid" && b.method !== "demo"),
        revenue = paid.reduce((n, b) => n + b.total, 0),
        soldItems = summarizeSoldItems(data.bills),
        sold = soldItems.reduce((n, item) => n + item.quantity, 0);

    return {
        language,
        t,
        productText,
        money,
        changeLanguage,
        view,
        setView,
        data,
        category,
        setCategory,
        search,
        setSearch,
        modal,
        setModal,
        edit,
        setEdit,
        busy,
        uploadImage,
        toast,
        setToast,
        token,
        setToken,
        receipt,
        setReceipt,
        loaded,
        refresh,
        admin,
        filtered,
        paid,
        revenue,
        sold,
        soldItems,
    };
}
export type KitchenController = ReturnType<typeof useKitchen>;
