"use client";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/landing/brand-logo";
import { SIDEBAR_NAV, SIDEBAR_BOTTOM_NAV } from "@/utils/constants/sidebar.constant";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { cn } from "@/lib/utils";
import { ISidebarProps } from "./props";

export default function AppSidebar({ className }: ISidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className={cn(className)}>
      {/* ── Brand */}
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

      {/* ── Main nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.title}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Bottom nav + user */}
      <SidebarFooter className="pb-4">
        <Separator className="mb-2" />
        <SidebarMenu>
          {SIDEBAR_BOTTOM_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={active}
                  tooltip={item.title}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {user && (
          <Link
            href="/settings"
            aria-label="Open profile settings"
            className="mt-2 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs">
                {user.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-none">
                  {user.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
