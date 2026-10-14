export const viewRoutes = {
    dashboard: "/dashboard",
    menu: "/dashboard/menu",
    bills: "/dashboard/bills",
    finance: "/dashboard/finance",
} as const;

export type KitchenView = keyof typeof viewRoutes;

export function viewFromPath(pathname: string): KitchenView {
    const path = pathname.replace(/\/$/, "") || "/";
    return (
        (Object.entries(viewRoutes).find(
            ([, route]) => route === path,
        )?.[0] as KitchenView) ?? "dashboard"
    );
}
