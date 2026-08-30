"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";

export function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) {
    // A failed fetch to a Go service that isn't running surfaces as a bare
    // "Failed to fetch", which tells a shop owner nothing useful.
    if (err.message === "Failed to fetch") {
      return "Can't reach the QuickCarry API. Check that it's running and NEXT_PUBLIC_API_BASE_URL points at it.";
    }
    return err.message;
  }
  return "Something went wrong.";
}

type Loaded<T> = {
  // Which request this result belongs to. Comparing it against the current
  // key derives `loading` during render, so nothing has to set state
  // synchronously inside the effect just to flip a spinner on.
  key: string;
  data: T | null;
  error: string;
};

/**
 * Loads data on mount, whenever `deps` change, and whenever `reload` is
 * called. Deliberately small — the dashboard's data needs are per-page
 * fetches, not a cache layer.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [nonce, setNonce] = useState(0);
  const key = JSON.stringify([deps, nonce]);

  const [loaded, setLoaded] = useState<Loaded<T>>({
    key: "",
    data: null,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;
    fn().then(
      (data) => {
        if (!cancelled) setLoaded({ key, data, error: "" });
      },
      (err) => {
        if (!cancelled) setLoaded({ key, data: null, error: errorMessage(err) });
      },
    );
    return () => {
      cancelled = true;
    };
    // `fn` is intentionally excluded: callers pass an inline arrow, and the
    // request should re-run on `deps`, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const settled = loaded.key === key;
  return {
    data: settled ? loaded.data : null,
    error: settled ? loaded.error : "",
    loading: !settled,
    reload,
  };
}
