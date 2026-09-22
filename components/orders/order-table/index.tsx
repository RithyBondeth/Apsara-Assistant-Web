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
import { formatMoney } from "@/utils/functions/money";
import { cn } from "@/lib/utils";
import { useAppT, fmt, plural } from "@/hooks/utils/use-app-translations";
import { useLanguage } from "@/components/utils/languages/language-context";
import { IOrderTableProps } from "./props";

export default function OrderTable({
  orders,
  customers,
  onSelect,
}: IOrderTableProps) {
  const t = useAppT("orders");
  const language = useLanguage();

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">{t.table.empty}</p>
      </div>
    );
  }

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? fmt(t.table.customerFallback, { id: id.slice(0, 8) });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.table.customer}</TableHead>
            <TableHead className="hidden sm:table-cell">{t.table.items}</TableHead>
            <TableHead>{t.table.total}</TableHead>
            <TableHead className="hidden md:table-cell">{t.table.status}</TableHead>
            <TableHead className="hidden lg:table-cell text-right">{t.table.placed}</TableHead>
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
                aria-label={fmt(t.table.rowAria, { customer: customerName(order.customer_id), status: t.status[order.status] })}
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
                  {plural(t.table.lines, order.items.length)}
                  <span className="text-xs"> · {plural(t.table.units, units)}</span>
                </TableCell>
                <TableCell className="font-medium">
                  {formatMoney(order.total_amount, order.currency)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={cn(ORDER_STATUS_STYLES[order.status])}>
                    {t.status[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right text-xs text-muted-foreground">
                  {timeAgo(order.created_at, language)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
