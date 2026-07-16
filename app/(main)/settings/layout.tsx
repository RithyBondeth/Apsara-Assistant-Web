"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideUser,
  LucidePalette,
  LucideLock,
  LucideRadioTower,
  LucideArrowUpRight,
} from "lucide-react";
import AppHeader from "@/components/header";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useT("settings");
  const tChannels = useT("channels");

  const nav = [
    { title: t.account, href: "/settings", icon: LucideUser },
    { title: t.appearance, href: "/settings/appearance", icon: LucidePalette },
    { title: t.security, href: "/settings/security", icon: LucideLock },
  ];

  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex-1 p-6 lg:p-8">
        {/* No fixed cap — one would leave a dead gutter on wide screens. The
            forms stay readable because the FIELDS inside each card lay out in a
            responsive grid rather than stretching to the card's width. */}
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {/* ── Section nav */}
            <nav className="flex gap-1 overflow-x-auto md:w-48 md:shrink-0 md:flex-col md:overflow-visible">
              {nav.map((item) => {
                // /settings is the index, so only it matches exactly; the rest
                // match their subtree.
                const active =
                  item.href === "/settings"
                    ? pathname === "/settings"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.title}
                  </Link>
                );
              })}

              {/* Channels moved out to its own top-level page — it's the thing
                  that turns the product on, not a preference. This pointer is
                  for people who still look for it here. */}
              <Link
                href="/channels"
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground md:mt-1 md:border-t md:border-border md:pt-3"
              >
                <LucideRadioTower className="size-4 shrink-0" />
                {tChannels.title}
                <LucideArrowUpRight className="ml-auto size-3.5 shrink-0 opacity-50" />
              </Link>
            </nav>

            {/* ── Section content */}
            <div className="min-w-0 flex-1 space-y-4">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}
