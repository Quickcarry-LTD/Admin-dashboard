import type { User } from "./types";

// The API is a separate Go service that authenticates with a bearer JWT,
// so there's no cookie for a server component to read — the token lives in
// localStorage and every dashboard page is a client component.
//
// localStorage is an external store, so it's exposed as one: components
// read it through useSyncExternalStore rather than copying it into state
// inside an effect. Signing out in one tab then updates every other tab.
//
// Keys are namespaced separately from the merchant dashboard's
// (qc.merchant.*) so running both against the same origin during
// development doesn't have one clobber the other's session.
const ACCESS_KEY = "qc.admin.access";
const REFRESH_KEY = "qc.admin.refresh";
const USER_KEY = "qc.admin.user";

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

// localStorage throws in a few real browser configurations (private mode,
// site data blocked), and doesn't exist during SSR — every access is
// guarded rather than assumed.
function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the session just won't survive a reload */
  }
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to clear */
  }
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

// useSyncExternalStore compares snapshots by identity, so a fresh object
// per call would loop forever. The parsed session is cached and only
// rebuilt when the underlying strings actually change.
let cachedKey: string | null = null;
let cachedSession: Session | null = null;

export function getSessionSnapshot(): Session | null {
  const accessToken = read(ACCESS_KEY);
  const refreshToken = read(REFRESH_KEY);
  const rawUser = read(USER_KEY);
  const key = `${accessToken} ${refreshToken} ${rawUser}`;

  if (key === cachedKey) return cachedSession;
  cachedKey = key;

  if (!accessToken || !refreshToken || !rawUser) {
    cachedSession = null;
    return null;
  }
  try {
    cachedSession = {
      accessToken,
      refreshToken,
      user: JSON.parse(rawUser) as User,
    };
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

// On the server there is never a session — the shell renders its loading
// state and the real answer arrives on hydration.
export function getServerSessionSnapshot(): Session | null {
  return null;
}

export function subscribeToSession(onChange: () => void) {
  listeners.add(onChange);
  // "storage" only fires in *other* tabs, which is exactly the case the
  // local listener set doesn't cover.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function loadSession(): Session | null {
  return getSessionSnapshot();
}

export function saveSession(session: Session) {
  write(ACCESS_KEY, session.accessToken);
  write(REFRESH_KEY, session.refreshToken);
  write(USER_KEY, JSON.stringify(session.user));
  emit();
}

export function clearSession() {
  remove(ACCESS_KEY);
  remove(REFRESH_KEY);
  remove(USER_KEY);
  emit();
}

export function getAccessToken(): string | null {
  return read(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_KEY);
}
