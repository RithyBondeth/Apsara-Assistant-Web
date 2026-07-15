"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, ORDER_STATUS_STYLES } from "@/utils/constants/orders.constant";
import { OrderStatus } from "@/utils/interfaces/order/order.interface";
import { formatCurrency } from "@/utils/functions/currency";
import { formatDate } from "@/utils/functions/date";
import { cn } from "@/lib/utils";
import { IOrderTableProps } from "./props";

export default function OrderTable({
  orders,
  customers,
  onStatusChange,
  onDelete,
  busy,
}: IOrderTableProps) {
  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c])),
    [customers]
  );

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          No orders yet. They&apos;ll appear here once you create one from a
          conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead className="hidden sm:table-cell">Customer</TableHead>
            <TableHead className="hidden md:table-cell">Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="hidden lg:table-cell">Placed</TableHead>
            <TableHead className="w-40">Status</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const customer = customerMap[order.customer_id];
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-mono text-xs font-medium">
                    #{order.id.slice(0, 8)}
                  </p>
                  {order.delivery_address && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {order.delivery_address}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {customer?.name ?? (
                    <span className="text-muted-foreground">Unknown</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {itemCount}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell>
                  {/* Changing to "cancelled" restocks every line item server-side. */}
                  <select
                    aria-label={`Status for order ${order.id.slice(0, 8)}`}
                    value={order.status}
                    disabled={busy}
                    onChange={(e) =>
                      onStatusChange(order.id, e.target.value as OrderStatus)
                    }
                    className={cn(
                      "h-7 w-full rounded-md border-0 px-2 text-xs font-medium capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      ORDER_STATUS_STYLES[order.status]
                    )}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    aria-label="Delete order"
                    onClick={() => onDelete(order.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
