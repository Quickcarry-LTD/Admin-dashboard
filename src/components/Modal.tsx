"use client";

import { useEffect, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // Escape closes, and the body stops scrolling behind the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      {/* Full-width sheet on a phone, centred dialog from sm up — a centred
          box with side margins wastes the little width a phone has. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card shadow-pop sm:rounded-2xl"
      >
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-card px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-base text-secondary-foreground">{description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            <XMarkIcon />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
