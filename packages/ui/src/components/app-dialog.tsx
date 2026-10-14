"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@junexa/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@junexa/ui/components/dialog";
import { cn } from "@junexa/ui/lib/utils";

// Set only in browser focus events; consecutive dialogs keep the original opener.
let lastOutsideFocus: HTMLElement | null = null;

type AppDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    closeLabel: string;
    busy?: boolean;
    eyebrow?: ReactNode;
    className?: string;
    children: ReactNode;
};

export function AppDialog({ open, onOpenChange, title, closeLabel, busy = false, eyebrow, className, children }: AppDialogProps) {
    const returnFocus = useRef<HTMLElement | null>(null);

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
            <DialogContent
                showCloseButton={false}
                aria-describedby={undefined}
                className={cn("modal max-h-[90dvh] overflow-y-auto gap-0 p-6 text-base sm:max-w-[540px] sm:p-8", className)}
                onOpenAutoFocus={() => {
                    const active = document.activeElement;
                    if (active instanceof HTMLElement && active !== document.body && !active.closest('[role="dialog"]')) {
                        lastOutsideFocus = active;
                    }
                    returnFocus.current = lastOutsideFocus;
                }}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    if (document.querySelector('[data-slot="dialog-content"][data-state="open"]')) return;
                    if (returnFocus.current?.isConnected) returnFocus.current.focus();
                }}
                onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
                onInteractOutside={(event) => { if (busy) event.preventDefault(); }}
            >
                <DialogHeader className="mb-4 pr-10">
                    {eyebrow && <span className="eyebrow mb-0">{eyebrow}</span>}
                    <DialogTitle className="mb-2 text-2xl leading-snug font-semibold tracking-tight">{title}</DialogTitle>
                </DialogHeader>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" size="icon" disabled={busy} aria-label={closeLabel} className="absolute top-3 right-3">
                        <X className="size-5" aria-hidden="true" />
                    </Button>
                </DialogClose>
                {children}
            </DialogContent>
        </Dialog>
    );
}
