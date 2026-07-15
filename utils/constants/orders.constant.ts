import { OrderStatus } from "@/utils/interfaces/order/order.interface";

/** Mirrors VALID_STATUSES in the backend's endpoints/orders.py. */
export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-muted text-muted-foreground",
};

/**
 * Saturated fills for chart bars. The badge backgrounds above are deliberately
 * pale for text contrast, which reads as washed-out on a bar.
 */
export const ORDER_STATUS_BAR: Record<OrderStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  processing: "bg-indigo-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-muted-foreground/40",
};
