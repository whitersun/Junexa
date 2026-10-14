"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bill } from "@junexa/shared/data";
import type { BillsPage } from "@/lib/bill-pagination";

export function useBillPages(token: string, enabled: boolean, revision: Bill[]) {
    const [search, setSearch] = useState("");
    const [bills, setBills] = useState<Bill[]>([]);
    const [page, setPage] = useState<BillsPage | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState(false);
    const loader = useRef<(() => void) | null>(null);
    const query = search.trim().replace(/^#/, "").toLowerCase();

    useEffect(() => {
        setBills([]);
        setPage(null);
        setError(false);
        setLoading(enabled);
        if (!enabled) return;

        let active = true;
        let ready = false;
        let started = false;
        let cursor: string | null = null;
        let request: AbortController | null = null;

        async function load() {
            if (!active || !ready || request || (started && cursor === null)) return;
            const controller = new AbortController();
            request = controller;
            setLoading(true);
            setError(false);
            try {
                const params = new URLSearchParams({ search: query, limit: "20" });
                if (cursor) params.set("cursor", cursor);
                const response = await fetch(`/api/bills?${params}`, {
                    headers: { authorization: `Bearer ${token}` },
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!response.ok) throw Error("Unable to load bills");
                const next: BillsPage = await response.json();
                if (!active || controller.signal.aborted) return;
                setBills((previous) => {
                    const ids = new Set(previous.map((bill) => bill.id));
                    return [...previous, ...next.bills.filter((bill) => !ids.has(bill.id))];
                });
                setPage(next);
                cursor = next.nextCursor;
                started = true;
            } catch {
                if (active && !controller.signal.aborted) setError(true);
            } finally {
                if (active) {
                    request = null;
                    setLoading(false);
                }
            }
        }

        loader.current = () => { void load(); };
        const timer = setTimeout(() => {
            ready = true;
            void load();
        }, query ? 300 : 0);

        return () => {
            active = false;
            clearTimeout(timer);
            request?.abort();
            loader.current = null;
        };
    }, [enabled, token, query, revision]);

    const loadMore = useCallback(() => { loader.current?.(); }, []);
    return { search, setSearch, bills, page, loading, error, loadMore };
}
