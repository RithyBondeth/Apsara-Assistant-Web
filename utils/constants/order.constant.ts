import { TOrderStatus } from "@/utils/interfaces/order/order.interface";

export const ORDER_STATUSES: TOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_STYLES: Record<TOrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-muted text-muted-foreground",
};

// Cancelling returns an order's items to stock, and reviving it takes them out
// again — the server refuses the revival if the stock has since sold, so these
// two transitions are the ones that can fail.
export const ORDER_STATUS_HINTS: Partial<Record<TOrderStatus, string>> = {
  cancelled: "Cancelling returns these items to your stock.",
};

export const SHARED_SELECT_CLASS =
  "flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
