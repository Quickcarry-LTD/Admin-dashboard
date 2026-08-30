// The sidebar's collapsed/expanded preference lives in localStorage, which
// makes it an external store rather than component state. Reading it through
// useSyncExternalStore gives the right answer on the client without a
// setState inside an effect, and without the server and client disagreeing
// during hydration (the server snapshot is always "expanded").

const KEY = "qc.admin.sidebar-dense";
const listeners = new Set<() => void>();

export function subscribeDense(onChange: () => void): () => void {
  listeners.add(onChange);
  // "storage" fires only in *other* tabs, which is exactly the case the
  // local listener set does not cover.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getDense(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** No DOM on the server; the sidebar renders expanded until hydration. */
export function getServerDense(): boolean {
  return false;
}

export function setDense(next: boolean): void {
  try {
    localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    /* storage blocked — not remembered, but the toggle still applies */
  }
  listeners.forEach((listener) => listener());
}
