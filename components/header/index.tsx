"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { IHeaderProps } from "./props";

/**
 * Identity, Settings and Log out live in the sidebar's user menu (NavUser).
 * The header used to carry a second avatar dropdown with the same contents,
 * which meant the same user was rendered twice on every screen.
 */
export default function AppHeader({ title }: IHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      {/* ── Sidebar Toggle ───────────────────────────────────────── */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* ── Page Title ──────────────────────────────────────────── */}
      <h1 className="flex-1 text-base font-semibold">{title}</h1>
    </header>
  );
}
