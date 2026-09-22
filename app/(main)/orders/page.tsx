"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import AppHeader from "@/components/header";
import DeepLink from "@/components/shared/deep-link";
import OrderTable from "@/components/orders/order-table";
import OrderDetailDialog from "@/components/orders/order-detail-dialog";
import NewOrderDialog from "@/components/orders/new-order-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { ORDER_STATUSES, SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import {
  IOrder,
  IOrderCreate,
  TOrderStatus,
} from "@/utils/interfaces/order/order.interface";
import EmptyState from "@/components/shared/empty-state";
import { useAppT, fmt, plural } from "@/hooks/utils/use-app-translations";

export default function OrdersPage() {
  // ── All States
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | "all">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const t = useAppT("orders");

  // ── API Integration
  const {
    orders,
    selected,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    createCheckout,
    receipts,
    receiptsLoading,
    fetchReceipts,
    confirmReceipt,
    rejectReceipt,
    selectOrder,
    clearError,
  } = useOrdersStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { products, fetchProducts } = useProductsStore();

  // ── Effects
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [fetchCustomers, fetchProducts]);

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [fetchOrders, statusFilter]);

  // `/orders?order=<id>` — where a payment alert on Telegram lands.
  const openFromLink = useCallback(async (id: string) => {
    clearError();
    await fetchOrder(id);
    void fetchReceipts(id);
    setDetailOpen(true);
  }, [clearError, fetchOrder, fetchReceipts]);

  // ── Methods
  function handleSelect(order: IOrder) {
    clearError();
    selectOrder(order);
    void fetchReceipts(order.id);
    setDetailOpen(true);
  }

  async function handleStatusChange(status: TOrderStatus) {
    if (!selected) return false;
    const ok = await updateOrder(selected.id, { status });
    // A status change moves stock, so the catalogue on screen is now stale.
    if (ok) fetchProducts();
    return ok;
  }

  async function handleDelete() {
    if (!selected) return false;
    const ok = await deleteOrder(selected.id);
    if (ok) fetchProducts();
    return ok;
  }

  async function handleCreate(data: IOrderCreate) {
    const order = await createOrder(data);
    if (order) fetchProducts();
    return Boolean(order);
  }

  // ── Render UI
  return (
    <>
      <AppHeader title={t.title} description={t.description} />
      <DeepLink param="order" onValue={openFromLink} />

      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
              {plural(t.count, orders.length)}
            </p>
            <select
              aria-label={t.filterStatus}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TOrderStatus | "all")}
            className={`${SHARED_SELECT_CLASS} w-40`}
            >
              <option value="all">{t.allStatuses}</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t.status[status]}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={() => {
              clearError();
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t.newOrder}
          </Button>
        </div>

        {/* Errors raised while the dialogs are closed would otherwise be
            invisible — the dialogs surface their own. */}
        {error && !detailOpen && !createOpen && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && orders.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={statusFilter === "all"
              ? t.noOrders
              : fmt(t.noOrdersWithStatus, { status: t.status[statusFilter].toLowerCase() })}
            description={statusFilter === "all" ? t.noOrdersHelp : t.noOrdersFilterHelp}
          >
            {statusFilter === "all" ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                {t.createFirst}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setStatusFilter("all")}>
                {t.clearFilter}
              </Button>
            )}
          </EmptyState>
        ) : (
          <OrderTable
            orders={orders}
            customers={customers}
            onSelect={handleSelect}
          />
        )}
      </main>

      <OrderDetailDialog
        order={selected}
        customer={customers.find((c) => c.id === selected?.customer_id)}
        products={products}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onCreateCheckout={() =>
          selected ? createCheckout(selected.id) : Promise.resolve(null)
        }
        receipts={receipts}
        receiptsLoading={receiptsLoading}
        onConfirmReceipt={(receiptId) =>
          selected ? confirmReceipt(selected.id, receiptId) : Promise.resolve(false)
        }
        onRejectReceipt={(receiptId) =>
          selected ? rejectReceipt(selected.id, receiptId) : Promise.resolve(false)
        }
        error={error}
        onDismissError={clearError}
      />

      <NewOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        products={products}
        onCreate={handleCreate}
        error={error}
        onDismissError={clearError}
      />
    </>
  );
}
