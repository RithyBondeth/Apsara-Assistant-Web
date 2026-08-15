"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AppHeader from "@/components/header";
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

export default function OrdersPage() {
  // ── All States
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | "all">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // ── API Integration
  const {
    orders,
    selected,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    createCheckout,
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

  // ── Methods
  function handleSelect(order: IOrder) {
    clearError();
    selectOrder(order);
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
      <AppHeader title="Orders" />

      <main className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TOrderStatus | "all")}
              className={`${SHARED_SELECT_CLASS} w-40`}
            >
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
            New order
          </Button>
        </div>

        {/* Errors raised while the dialogs are closed would otherwise be
            invisible — the dialogs surface their own. */}
        {error && !detailOpen && !createOpen && (
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
