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
import { BrandLogo } from "@/components/landing/brand-logo";
import NavUser from "@/components/sidebar/nav-user";
import { SIDEBAR_NAV } from "@/utils/constants/sidebar.constant";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";
import { ISidebarProps } from "./props";

export default function AppSidebar({ className }: ISidebarProps) {
  const pathname = usePathname();
  const t = useT("sidebar");
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
                const title = t[item.key];
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User menu (Settings + Log out live inside it) */}
      <SidebarFooter className="pb-3">
        <Separator className="mb-1" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
