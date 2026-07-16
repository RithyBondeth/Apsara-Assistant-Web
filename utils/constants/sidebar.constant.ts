import {
  LayoutDashboard,
  RadioTower,
  Package,
  MessageCircle,
  Users,
  ShoppingCart,
  BarChart3,
  LucideIcon,
} from "lucide-react";

/** Keys into the `sidebar` section of the language files. */
export type SidebarNavKey =
  | "dashboard"
  | "channels"
  | "products"
  | "customers"
  | "chat"
  | "orders"
  | "analytics";

export interface ISidebarNavItem {
  key: SidebarNavKey;
  href: string;
  icon: LucideIcon;
}

// Channels sits directly under Dashboard: until a seller connects one, the
// assistant never receives a message and every other screen stays empty.
export const SIDEBAR_NAV: ISidebarNavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "channels", href: "/channels", icon: RadioTower },
  { key: "products", href: "/products", icon: Package },
  { key: "customers", href: "/customers", icon: Users },
  { key: "chat", href: "/chat", icon: MessageCircle },
  { key: "orders", href: "/orders", icon: ShoppingCart },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
];

// Settings is reached from the sidebar's user menu (components/sidebar/nav-user)
// rather than a standalone bottom-nav entry.
