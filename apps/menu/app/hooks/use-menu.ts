"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bill, Product } from "@junexa/shared/data";
import { locales } from "@junexa/shared/i18n";
import { useLanguage } from "@junexa/shared/use-language";
export function useMenu() {
    const language = useLanguage();
    const [data, setData] = useState<{ products: Product[] }>({ products: [] });
    const [category, setCategory] = useState("Tất cả");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<Record<string, number>>({});
    const [modal, setModal] = useState<"checkout" | null>(null);
    const [customer, setCustomer] = useState("");
    const [method, setMethod] = useState("cash");
    const [busy, setBusy] = useState(false);
    const submitting = useRef(false);
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const [receipt, setReceipt] = useState<Bill | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [mobileCart, setMobileCart] = useState(false);
    const refresh = useCallback(async () => {
        try {
            const response = await fetch("/api/menu", { cache: "no-store" });
            const result = await response.json();
            if (!response.ok) throw Error(result.error);
            setData({ products: result.products });
            setError("");
            setLoaded(true);
        } catch (e) { setError((e as Error).message); }
    }, []);
    useEffect(() => { void refresh(); }, [refresh]);
    useEffect(() => {
        if (!toast) return;
        const timeout = setTimeout(() => setToast(""), 4500);
        return () => clearTimeout(timeout);
    }, [toast]);
    const cartItems = data.products.filter(p => cart[p.id] > 0);
    const count = cartItems.reduce((n, p) => n + cart[p.id], 0);
    const total = cartItems.reduce((n, p) => n + p.price * cart[p.id], 0);
    function add(id: string, amount = 1) {
        setCart(current => ({ ...current, [id]: Math.min(99, Math.max(0, (current[id] || 0) + amount)) }));
    }
    async function checkout() {
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true);
        try {
            const response = await fetch("/api/orders", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customer, method, items: cartItems.map(p => ({ productId: p.id, quantity: cart[p.id] })) }),
            });
            const result = await response.json();
            if (!response.ok) throw Error(result.error);
            setReceipt(result);
            setCart({});
            setModal(null);
            setMobileCart(false);
            await refresh();
        } catch (e) { setToast((e as Error).message); }
        finally { submitting.current = false; setBusy(false); }
    }
    const filtered = data.products.filter(p =>
        (category === "Tất cả" || p.category === category) &&
        [p.name, language.productText(p, "name")].some(name => name.toLocaleLowerCase(locales[language.language]).includes(search.toLocaleLowerCase(locales[language.language])))
    );
    return { ...language, data, category, setCategory, search, setSearch, cart, setCart, modal, setModal, customer, setCustomer, method, setMethod, busy, toast, setToast, error, receipt, setReceipt, loaded, mobileCart, setMobileCart, refresh, cartItems, count, total, add, checkout, filtered };
}
export type MenuController = ReturnType<typeof useMenu>;
