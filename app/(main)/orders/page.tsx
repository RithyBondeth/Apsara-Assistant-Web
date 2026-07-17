"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import AppHeader from "@/components/header";
import OrderTable from "@/components/orders/order-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { ORDER_STATUSES } from "@/utils/constants/orders.constant";
import { OrderStatus } from "@/utils/interfaces/order/order.interface";
import { formatCurrency } from "@/utils/functions/currency";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";

type StatusFilter = OrderStatus | "all";

export default function OrdersPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("orders");
  const tc = useT("common");

  // ── API Integration ────────────────────────────────────────────────────────
  const { orders, loading, error, fetchOrders, updateOrder, deleteOrder } =
    useOrdersStore();
  const { customers, fetchCustomers } = useCustomersStore();

  // ── All States ─────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<StatusFilter>("all");

  // ── Effects: the API does the filtering, so refetch when it changes ────────
  useEffect(() => {
    fetchOrders(status === "all" ? undefined : { status });
  }, [fetchOrders, status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleStatusChange(id: string, next: OrderStatus) {
    if (
      next === "cancelled" &&
      !confirm(t.cancelConfirm)
    ) {
      return;
    }
    await updateOrder(id, { status: next });
  }

  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    await deleteOrder(id);
  }

  // ── Revenue excludes cancelled orders, matching the dashboard's definition. 
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {fmt(orders.length === 1 ? t.countOne : t.countOther, {
              count: orders.length,
            })}
            {orders.length > 0 && (
              <>
                {" · "}
                {fmt(t.revenueNote, { amount: formatCurrency(revenue) })}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label={t.filterLabel}
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-8 rounded-lg border border-input bg-background px-3 text-sm capitalize outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">{t.allStatuses}</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tc.orderStatus[s]}
                </option>
              ))}
            </select>

            <Link
              href="/orders/new"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t.add}
            </Link>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && orders.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <OrderTable
            orders={orders}
            customers={customers}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            busy={loading}
          />
        )}
      </main>
    </>
  );
}
