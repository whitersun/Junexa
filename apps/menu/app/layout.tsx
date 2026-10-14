import "@junexa/ui/styles/globals.css";
import "@junexa/shared/theme.scss";
import "@junexa/shared/styles/themes.css";
import "@junexa/shared/styles/theme-controls.css";
import { ThemeProvider } from "@junexa/shared/theme-provider";
import { themeInitScript } from "@junexa/shared/theme";
export const metadata = {
    title: "Junexa — Một chút ngon, một ngày vui",
    description: "Chọn món ăn, nước uống và gửi đơn đến Junexa.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
            <body><ThemeProvider>{children}</ThemeProvider></body>
        </html>
    );
}
