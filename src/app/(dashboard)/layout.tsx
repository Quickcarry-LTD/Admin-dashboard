"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import LayoutProvider from "@/components/LayoutContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { LoadingBlock } from "@/components/Feedback";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // Render nothing real until the session is known — otherwise the shell
  // paints, then yanks itself away on redirect. There is no per-route role
  // check the way a multi-role dashboard needs one: every page here is
  // admin-only, and AuthProvider already refuses a non-admin session.
  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingBlock label="Checking session" />
      </div>
    );
  }

  return (
    <LayoutProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">{children}</div>
          </main>
          <footer className="flex h-14 shrink-0 items-center border-t border-border px-4 md:px-8">
            <span className="text-base text-secondary-foreground">
              QuickCarry Admin &copy; {new Date().getFullYear()}
            </span>
          </footer>
        </div>
      </div>
    </LayoutProvider>
  );
}
