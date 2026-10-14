"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@junexa/ui/components/button";

export function ThemeToggle({ t }: { t: (text: string) => string }) {
    const { theme, toggleTheme } = useTheme();
    const label = t(theme === null ? "Chuyển giao diện sáng / tối" : theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối");

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="theme-toggle text-secondary-foreground"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
        >
            <Sun className="theme-sun size-5" aria-hidden="true" />
            <Moon className="theme-moon size-5" aria-hidden="true" />
        </Button>
    );
}
