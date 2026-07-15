"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideUser, LucidePalette, LucideLock, LucidePlug } from "lucide-react";
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

  const nav = [
    { title: t.account, href: "/settings", icon: LucideUser },
    { title: t.appearance, href: "/settings/appearance", icon: LucidePalette },
    { title: t.security, href: "/settings/security", icon: LucideLock },
    { title: t.integrations, href: "/settings/integrations", icon: LucidePlug },
  ];

  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex-1 p-6 lg:p-8">
        {/* Anchored left rather than centred: with the app sidebar already on
            the left, centring a fixed-width block just opens a dead gutter on
            both sides. Capped so the forms don't stretch on wide screens. */}
        <div className="w-full max-w-5xl">
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
            </nav>

            {/* ── Section content */}
            <div className="min-w-0 flex-1 space-y-4">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}
