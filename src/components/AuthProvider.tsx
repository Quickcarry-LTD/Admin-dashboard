"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, clearSession, saveSession } from "@/lib/api";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeToSession,
} from "@/lib/session";
import type { User } from "@/lib/types";

// Unlike the merchant dashboard, this app serves exactly one role. Every
// route under /admin is mounted with AuthRequired(issuer, "admin"), so any
// other account would 403 on every request the shell makes.
export const HOME = "/";

type AuthContextValue = {
  user: User | null;
  // Distinguishes "no session" from "haven't looked yet". The stored
  // session is invisible during SSR and the hydration render, so guarded
  // pages must wait for this before deciding to bounce anyone to /login.
  ready: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// A store that reports "not hydrated" on the server and "hydrated" on the
// client, without an effect writing state.
const noopSubscribe = () => () => {};
const hydratedOnClient = () => true;
const notHydratedOnServer = () => false;

export default function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    hydratedOnClient,
    notHydratedOnServer,
  );
  const router = useRouter();

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = await api.login(email, password);

    // The API issues a token for any role, but only an admin has pages
    // here. Rejecting it at the door says why, instead of letting every
    // panel on the overview fail with its own 403.
    if (auth.user.role !== "admin") {
      throw new Error(
        `This panel is for QuickCarry staff. That account is registered as a ${auth.user.role}.`,
      );
    }

    saveSession({
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      user: auth.user,
    });
    return auth.user;
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    clearSession();
    router.replace("/login");
  }, [router]);

  const stored = session?.user ?? null;
  // A session written by another QuickCarry app on this origin, or one left
  // over from a role change, is treated as no session at all.
  const user = stored?.role === "admin" ? stored : null;

  const value = useMemo(
    () => ({ user, ready: hydrated, signIn, signOut }),
    [user, hydrated, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
