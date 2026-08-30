"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { getServerTheme, getTheme, setTheme, subscribeTheme } from "@/lib/theme";
import Button from "./Button";

/**
 * Reads the current theme through useSyncExternalStore rather than component
 * state, because the DOM attribute on <html> is the source of truth — it is
 * written before hydration by the inline script in layout.tsx.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
