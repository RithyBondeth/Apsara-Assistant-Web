"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/landing/brand-logo";
import NavUser from "@/components/sidebar/nav-user";
import { SIDEBAR_NAV } from "@/utils/constants/sidebar.constant";
import { useDashboardStore } from "@/stores/apis/dashboard/dashboard.store";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";
import { ISidebarProps } from "./props";

export default function AppSidebar({ className }: ISidebarProps) {
  const pathname = usePathname();
  const t = useT("sidebar");
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // The whole point of the badge is that the seller sees it WITHOUT being on
  // the Chat page, so it reads the shared stats the dashboard already loads.
  const { stats, fetchStats } = useDashboardStore();
  const needsMe = stats?.needs_me_conversations ?? 0;

  useEffect(() => {
    fetchStats();
  }, [fetchStats, pathname]);

  return (
    <Sidebar collapsible="icon" className={cn(className)}>
      {/* ── Brand ───────────────────────────────────────────────── */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center">
          {collapsed ? (
            <Image
              src="/brand/apsara-mark.svg"
              alt="Apsara Assistant"
              width={128}
              height={128}
              className="size-7 shrink-0"
            />
          ) : (
            <BrandLogo size="sm" />
          )}
        </div>
      </SidebarHeader>

      <Separator />

      {/* ── Main Navigation ─────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_NAV.map((item) => {
                const title = t[item.key];
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={
                        item.key === "chat" && needsMe > 0
                          ? `${title} (${needsMe})`
                          : title
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{title}</span>
                      {item.key === "chat" && needsMe > 0 && (
                        <span
                          className={cn(
                            "ml-auto rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold leading-4 text-white",
                            // Collapsed to icons: shrink to a dot pinned to the
                            // icon, since there's no room for the number.
                            collapsed &&
                              "absolute right-1 top-1 ml-0 size-2 px-0 text-transparent"
                          )}
                        >
                          {needsMe}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Menu ──────────────────────────────────────────── */}
      <SidebarFooter className="pb-3">
        <Separator className="mb-1" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
