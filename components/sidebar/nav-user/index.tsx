"use client";

import { useRouter } from "next/navigation";
import { LucideChevronsUpDown, LucideLogOut, LucideSettings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useT } from "@/hooks/utils/use-translations";

/**
 * The sidebar footer's user menu — the single place for identity, Settings and
 * Log out. Previously the footer showed a static (non-clickable) copy of the
 * user while the real menu lived in the header, so the same person was rendered
 * twice and only one of them did anything.
 */
export default function NavUser() {
  const router = useRouter();
  const t = useT("settings");
  const { user, logout } = useAuthStore();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (!user) return null;

  const initial = user.full_name?.charAt(0).toUpperCase() ?? "?";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              >
                {/* Matches the gradient avatar used on the Settings page so the
                    same user doesn't render two different ways. */}
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                  {initial}
                </span>

                {!collapsed && (
                  <>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium">
                        {user.full_name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                    <LucideChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  </>
                )}
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent
            align="end"
            side={collapsed ? "right" : "top"}
            sideOffset={8}
            className="w-56"
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                {initial}
              </span>
              <div className="grid min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <LucideSettings className="size-4" />
              {t.title}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LucideLogOut className="size-4" />
              {t.logOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
