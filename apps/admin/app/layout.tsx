import "@junexa/ui/styles/globals.css";
import "@junexa/shared/theme.scss";
import "@junexa/shared/styles/themes.css";
import "@junexa/shared/styles/theme-controls.css";
import { ThemeProvider } from "@junexa/shared/theme-provider";
import { themeInitScript } from "@junexa/shared/theme";
import { KitchenProvider } from "./components/kitchen/kitchen-provider";
export const metadata = {
    title: "Junexa Admin — Quản lý cửa hàng",
    description: "Quản lý thực đơn, đơn hàng và doanh thu Junexa",
};
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
            <body>
                <ThemeProvider><KitchenProvider>{children}</KitchenProvider></ThemeProvider>
            </body>
        </html>
    );
}
