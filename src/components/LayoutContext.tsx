"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getDense, getServerDense, setDense, subscribeDense } from "@/lib/sidebar";

type LayoutValue = {
  /** Desktop: the sidebar collapses to a 72px icon rail. */
  dense: boolean;
  toggleDense: () => void;
  /** Below md: the sidebar is an off-canvas drawer. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutValue | null>(null);

export default function LayoutProvider({ children }: { children: ReactNode }) {
  // Persisted preference, read from its store rather than mirrored into state.
  const dense = useSyncExternalStore(subscribeDense, getDense, getServerDense);
  // Ephemeral, so ordinary state is right for it.
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDense = useCallback(() => setDense(!getDense()), []);

  const value = useMemo(
    () => ({ dense, toggleDense, mobileOpen, setMobileOpen }),
    [dense, toggleDense, mobileOpen],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside LayoutProvider");
  return ctx;
}
