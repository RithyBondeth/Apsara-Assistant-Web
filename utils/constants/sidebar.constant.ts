import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Users,
  ShoppingCart,
  Settings,
  Plug,
  BarChart3,
} from "lucide-react";

export const SIDEBAR_NAV = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];


export const SIDEBAR_BOTTOM_NAV = [
  {
    title: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
