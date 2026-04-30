import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Users,
  ShoppingCart,
  Settings,
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
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
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
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
