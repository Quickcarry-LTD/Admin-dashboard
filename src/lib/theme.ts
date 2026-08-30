// The light/dark theme lives on <html data-theme> — it is written there
// before first paint by the inline script in layout.tsx, so the DOM, not
// React, is the source of truth.
//
// Exposing it as an external store lets components read it with
// useSyncExternalStore: the supported way to subscribe to something outside
// React, with no hydration mismatch and no setState inside an effect.

export type Theme = "light" | "dark";

const STORAGE_KEY = "qc.admin.theme";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

export function subscribeTheme(onChange: () => void): () => void {
  listeners.add(onChange);

  // Follow the OS while the user has made no explicit choice.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (readStoredTheme()) return;
    document.documentElement.setAttribute("data-theme", media.matches ? "dark" : "light");
    emit();
  };
  media.addEventListener("change", onMediaChange);

  return () => {
    listeners.delete(onChange);
    media.removeEventListener("change", onMediaChange);
  };
}

export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** The server has no DOM to read; light is the documented default. */
export function getServerTheme(): Theme {
  return "light";
}

export function setTheme(next: Theme): void {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private browsing — applies for this session, just not remembered */
  }
  emit();
}
