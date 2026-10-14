"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useKitchen, type KitchenController } from "@/app/hooks/use-kitchen";

const KitchenContext = createContext<KitchenController | null>(null);

// Admin state is retained only while navigating within the admin app.
export function KitchenProvider({ children }: { children: ReactNode }) {
    const kitchen = useKitchen();
    return (
        <KitchenContext.Provider value={kitchen}>
            {children}
        </KitchenContext.Provider>
    );
}

export function useKitchenContext() {
    const kitchen = useContext(KitchenContext);
    if (!kitchen) throw new Error("KitchenProvider is required");
    return kitchen;
}
