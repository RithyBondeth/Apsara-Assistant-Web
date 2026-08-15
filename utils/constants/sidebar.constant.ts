import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Users,
  ShoppingCart,
  Settings,
  Plug,
  BarChart3,
  Warehouse,
  Truck,
  Undo2,
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
    title: "Inventory",
    href: "/inventory",
    icon: Warehouse,
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
  { title: "Purchasing", href: "/purchasing", icon: Truck },
  { title: "Returns", href: "/returns", icon: Undo2 },
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
