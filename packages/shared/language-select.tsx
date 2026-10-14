"use client";

import type { Language } from "./i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@junexa/ui/components/select";

export function LanguageSelect({ language, changeLanguage }: { language: Language; changeLanguage: (value: Language) => void }) {
    return (
        <Select value={language} onValueChange={(value) => {
            if (value === "vi" || value === "en" || value === "zh-TW") changeLanguage(value);
        }}>
            <SelectTrigger aria-label="Language / Ngôn ngữ / 語言" className="w-auto min-w-28 bg-subtle">
                <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="zh-TW">繁體中文</SelectItem>
            </SelectContent>
        </Select>
    );
}
