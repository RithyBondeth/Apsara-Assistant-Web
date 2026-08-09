"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_STYLES } from "@/utils/constants/order.constant";
import { timeAgo } from "@/utils/functions/date";
import { cn } from "@/lib/utils";
import { IOrderTableProps } from "./props";

export default function OrderTable({
  orders,
  customers,
  onSelect,
}: IOrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      </div>
    );
  }

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? `Customer ${id.slice(0, 8)}`;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden sm:table-cell">Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell text-right">Placed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const units = order.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <TableRow
                key={order.id}
                // A bare onClick on the row leaves it unreachable by keyboard
                // and unannounced to a screen reader.
                role="button"
                tabIndex={0}
                aria-label={`Order for ${customerName(order.customer_id)}, ${order.status}`}
                onClick={() => onSelect(order)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(order);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TableCell>
                  <p className="font-medium">{customerName(order.customer_id)}</p>
                  {order.delivery_address && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {order.delivery_address}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {order.items.length} line{order.items.length !== 1 ? "s" : ""}
                  <span className="text-xs"> · {units} unit{units !== 1 ? "s" : ""}</span>
                </TableCell>
                <TableCell className="font-medium">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={cn("capitalize", ORDER_STATUS_STYLES[order.status])}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right text-xs text-muted-foreground">
                  {timeAgo(order.created_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
