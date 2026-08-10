import {
  TOrderStatus,
  TPaymentStatus,
} from "@/utils/interfaces/order/order.interface";

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

/** Payment sits apart from the order status, so it gets its own scale:
 *  neutral when nothing is owed yet, amber while a link is outstanding,
 *  green only once Stripe has confirmed the money. */
export const PAYMENT_STATUS_STYLES: Record<TPaymentStatus, string> = {
  unpaid: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};
