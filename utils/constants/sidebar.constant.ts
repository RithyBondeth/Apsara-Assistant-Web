import {
  LayoutDashboard,
  Package,
  Inbox,
  Users,
  ShoppingCart,
  Settings,
  Plug,
  BarChart3,
  Warehouse,
  Truck,
  Undo2,
} from "lucide-react";

// `key` names the label in the `nav` section of the app translations.
export type TNavKey =
  | "dashboard" | "products" | "inventory" | "customers" | "inbox" | "orders"
  | "purchasing" | "returns" | "analytics" | "integrations" | "settings";

export interface INavItem {
  key: TNavKey;
  href: string;
  icon: typeof LayoutDashboard;
}

export const SIDEBAR_NAV: INavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "products", href: "/products", icon: Package },
  { key: "inventory", href: "/inventory", icon: Warehouse },
  { key: "customers", href: "/customers", icon: Users },
  { key: "inbox", href: "/chat", icon: Inbox },
  { key: "orders", href: "/orders", icon: ShoppingCart },
  { key: "purchasing", href: "/purchasing", icon: Truck },
  { key: "returns", href: "/returns", icon: Undo2 },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
];

export const SIDEBAR_BOTTOM_NAV: INavItem[] = [
  { key: "integrations", href: "/integrations", icon: Plug },
  { key: "settings", href: "/settings", icon: Settings },
];
