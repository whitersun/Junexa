export type Theme = "light" | "dark";

export const themeStorageKey = "junexa-theme";

export function parseTheme(value: string | null): Theme | null {
    return value === "light" || value === "dark" ? value : null;
}

// Run in <head> before the body is painted to restore the saved appearance.
export const themeInitScript = `(() => {
    let theme = null;
    try {
        const saved = localStorage.getItem("${themeStorageKey}");
        if (saved === "light" || saved === "dark") theme = saved;
    } catch {}
    theme ??= window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
})();`;
