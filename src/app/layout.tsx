// ===============================================
// File: layout.tsx
//
// Purpose:
// The root layout for the entire Admin Dashboard. Loads the Inter
// font (matching the Customer/Rider apps), and renders the
// persistent Sidebar + Topbar shell around every page's content —
// matching the Figma's fixed left sidebar layout.
//
// Responsibilities:
// - Load fonts
// - Set page metadata
// - Render <Sidebar /> and <Topbar /> around {children}
// ===============================================

import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

// NOTE: next/font/google's Inter was used during development but this
// sandbox can't reach fonts.googleapis.com. Once you're building this
// locally or deploying, swap this back to:
//   import { Inter } from "next/font/google";
//   const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// and add `inter.variable` to the <html> className below.
// For now this falls back to the system font stack.

export const metadata: Metadata = {
  title: "QuickCarry Admin Panel",
  description: "Manage orders, riders, customers, and platform operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
