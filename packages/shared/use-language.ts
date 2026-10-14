"use client";
import type { Product } from "./data";
import { locales, translate, type Language } from "./i18n";
import { useEffect, useState } from "react";

export function useLanguage() {
    const [language, setLanguage] = useState<Language>("vi");
    const t = (text: string) => translate(text, language);
    const productText = (p: Product, field: "name" | "description") =>
        p.translations?.[language as "en" | "zh-TW"]?.[field]?.trim() ||
        t(p[field]);
    const money = (amount: number) =>
        new Intl.NumberFormat(locales[language], {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    useEffect(() => {
        try {
            const saved = localStorage.getItem("junexa-language");
            if (saved === "vi" || saved === "en" || saved === "zh-TW")
                setLanguage(saved);
        } catch {}
    }, []);
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);
    function changeLanguage(value: Language) {
        setLanguage(value);
        try {
            localStorage.setItem("junexa-language", value);
        } catch {}
    }

    return { language, t, productText, money, changeLanguage };
}
