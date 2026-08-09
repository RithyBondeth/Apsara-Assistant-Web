"use client";

import { useEffect, useMemo } from "react";
import { MessageCircle, Package, ShoppingCart, Users } from "lucide-react";
import AppHeader from "@/components/header";
import StatCard from "@/components/dashboard/stat-card";
import BreakdownCard from "@/components/analytics/breakdown-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { ORDER_STATUS_STYLES } from "@/utils/constants/order.constant";
import { formatMoney } from "@/utils/functions/money";
import { TOrderStatus } from "@/utils/interfaces/order/order.interface";

const PLATFORM_LABELS: Record<string, string> = {
  messenger: "Messenger",
  telegram: "Telegram",
  tiktok: "TikTok",
  website: "Website",
};

export default function AnalyticsPage() {
  // ── API Integration
  const { orders, loading: ordersLoading, fetchOrders } = useOrdersStore();
  const { products, loading: productsLoading, fetchProducts } = useProductsStore();
  const { customers, loading: customersLoading, fetchCustomers } = useCustomersStore();
  const { conversations, conversationsLoading, fetchConversations } = useChatStore();

  // ── Effects
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchConversations();
  }, [fetchOrders, fetchProducts, fetchCustomers, fetchConversations]);

  const loading =
    ordersLoading || productsLoading || customersLoading || conversationsLoading;

  // ── Derived
  const stats = useMemo(() => {
    // Cancelled orders are records, not sales.
    const sold = orders.filter((o) => o.status !== "cancelled");

    // Per currency, never summed across: orders keep whatever the shop traded
    // in when they were placed, so one total would be a meaningless number.
    const revenue: Record<string, number> = {};
    for (const order of sold) {
      revenue[order.currency] =
        (revenue[order.currency] ?? 0) + parseFloat(order.total_amount);
    }

    const byStatus: Record<string, number> = {};
    for (const order of orders) {
      byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
    }

    const byPlatform: Record<string, number> = {};
    for (const conversation of conversations) {
      byPlatform[conversation.platform] =
        (byPlatform[conversation.platform] ?? 0) + 1;
    }

    // Units shifted per product, from the line items already loaded.
    const unitsByProduct: Record<string, number> = {};
    for (const order of sold) {
      for (const item of order.items) {
        unitsByProduct[item.product_id] =
          (unitsByProduct[item.product_id] ?? 0) + item.quantity;
      }
    }
    const topProducts = Object.entries(unitsByProduct)
      .map(([id, units]) => ({
        key: id,
        // Not "Deleted product": orders and products load independently, so
        // an unresolved id usually means the catalogue has not arrived yet
        // rather than that anything was removed. Matches the placeholder
        // style used for customers elsewhere.
        label: products.find((p) => p.id === id)?.name ?? `Product ${id.slice(0, 8)}`,
        value: units,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const averages = Object.entries(revenue).map(([currency, total]) => ({
      currency,
      // Averaged within a currency only, for the same reason as above.
      value: total / sold.filter((o) => o.currency === currency).length,
    }));

    return { sold, revenue, byStatus, byPlatform, topProducts, averages };
  }, [orders, conversations, products]);

  const outOfStock = products.filter((p) => p.is_active && p.stock === 0);

  // ── Render UI
  if (loading && orders.length === 0 && products.length === 0) {
    return (
      <>
        <AppHeader title="Analytics" />
        <main className="flex-1 space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </main>
      </>
    );
  }

  const revenueLabel =
    Object.entries(stats.revenue)
      .map(([currency, total]) => formatMoney(total, currency))
      .join(" · ") || "—";

  return (
    <>
      <AppHeader title="Analytics" />

      <main className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label="Revenue"
            value={revenueLabel}
            sub={`${stats.sold.length} order${stats.sold.length !== 1 ? "s" : ""}, excl. cancelled`}
          />
          <StatCard
            icon={Package}
            label="Average order"
            value={
              stats.averages
                .map((a) => formatMoney(a.value, a.currency))
                .join(" · ") || "—"
            }
            sub="Per currency"
          />
          <StatCard
            icon={Users}
            label="Customers"
            value={customers.length}
            sub={`${stats.topProducts.length > 0 ? "with orders" : "no orders yet"}`}
          />
          <StatCard
            icon={MessageCircle}
            label="Conversations"
            value={conversations.length}
            sub={`${conversations.filter((c) => c.status === "open").length} open`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownCard
            title="Orders by status"
            rows={Object.entries(stats.byStatus).map(([status, count]) => ({
              key: status,
              label: status,
              value: count,
              badgeClass: ORDER_STATUS_STYLES[status as TOrderStatus],
            }))}
            capitalizeLabels
            empty="No orders yet."
          />

          <BreakdownCard
            title="Conversations by channel"
            rows={Object.entries(stats.byPlatform).map(([platform, count]) => ({
              key: platform,
              label: PLATFORM_LABELS[platform] ?? platform,
              value: count,
            }))}
            capitalizeLabels
            empty="No conversations yet. Connect a channel to start receiving them."
          />

          <BreakdownCard
            title="Best sellers"
            // Product names are left alone: capitalising them would rewrite
            // the seller's own spelling.
            rows={stats.topProducts}
            unit="units"
            empty="Nothing sold yet."
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Needs restocking</CardTitle>
            </CardHeader>
            <CardContent>
              {outOfStock.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Everything on sale is in stock.
                </p>
              ) : (
                <div className="divide-y">
                  {outOfStock.map((product) => (
                    <div key={product.id}
                         className="flex items-center justify-between py-2 text-sm">
                      <span className="truncate">{product.name}</span>
                      {/* Still listed and still being offered by the
                          assistant, which is why this is worth surfacing. */}
                      <span className="shrink-0 text-xs text-destructive">
                        Out of stock
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
