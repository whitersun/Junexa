"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { parseTheme, themeStorageKey, type Theme } from "./theme";

type ThemeContextValue = { theme: Theme | null; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(value: Theme) {
    document.documentElement.dataset.theme = value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme | null>(null);
    const preference = useRef<Theme | null>(null);

    useEffect(() => {
        const system = window.matchMedia("(prefers-color-scheme: dark)");
        try {
            preference.current = parseTheme(localStorage.getItem(themeStorageKey));
        } catch {}
        const syncTheme = () => {
            const next = preference.current ?? (system.matches ? "dark" : "light");
            applyTheme(next);
            setTheme(next);
        };
        const syncStorage = (event: StorageEvent) => {
            try {
                if (event.storageArea !== window.localStorage) return;
            } catch { return; }
            if (event.key !== themeStorageKey && event.key !== null) return;
            preference.current = parseTheme(event.newValue);
            syncTheme();
        };
        syncTheme();
        system.addEventListener("change", syncTheme);
        window.addEventListener("storage", syncStorage);
        return () => {
            system.removeEventListener("change", syncTheme);
            window.removeEventListener("storage", syncStorage);
        };
    }, []);

    function toggleTheme() {
        const current = parseTheme(document.documentElement.dataset.theme ?? null) ?? "light";
        const next = current === "dark" ? "light" : "dark";
        preference.current = next;
        applyTheme(next);
        setTheme(next);
        try {
            localStorage.setItem(themeStorageKey, next);
        } catch {}
    }

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}
