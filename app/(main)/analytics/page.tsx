"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { useOperationsStore } from "@/stores/apis/operations/operations.store";

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
  const { report, fetchReport } = useOperationsStore();

  // ── Effects
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchConversations();
    fetchReport(30, 30);
  }, [fetchOrders, fetchProducts, fetchCustomers, fetchConversations, fetchReport]);

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

  const lowStock = products.flatMap((product) =>
    product.is_active
      ? product.variants
          .filter((variant) => variant.is_active && variant.stock <= variant.low_stock_threshold)
          .map((variant) => ({ product, variant }))
      : [],
  );

  // ── Render UI
  if (loading && orders.length === 0 && products.length === 0) {
    return (
      <>
        <AppHeader title="Analytics" description="See what is selling and where attention is needed" />
        <main className="flex-1 space-y-6 p-4 text-left sm:p-6 lg:p-8">
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
      <AppHeader
        title="Analytics"
        description="See what is selling and where attention is needed"
      />

      <main className="flex-1 space-y-6 p-4 text-left sm:p-6 lg:p-8">
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
            sub={customers.length === 0 ? "No customers yet" : "Known customers"}
          />
          <StatCard
            icon={MessageCircle}
            label="Conversations"
            value={conversations.length}
            sub={`${conversations.filter((c) => c.status === "open").length} open`}
          />
        </div>

        {report && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="text-left"><CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><TrendingUp className="size-4 text-primary"/>Best sellers</CardTitle><p className="text-sm text-muted-foreground">Units sold in the last 30 days</p></CardHeader><CardContent>{report.best_sellers.length===0?<div className="py-8"><p className="font-medium">No fulfilled sales yet</p><p className="mt-1 text-sm text-muted-foreground">Best sellers will rank here once orders are fulfilled.</p></div>:<div className="divide-y">{report.best_sellers.slice(0,8).map((item,index)=><div key={item.variant_id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 py-3 text-sm"><span className="text-xs font-semibold text-muted-foreground">{String(index+1).padStart(2,"0")}</span><div><p className="font-medium">{item.product_name}</p><p className="text-xs text-muted-foreground">{item.variant_name}</p></div><span className="font-medium tabular-nums">{item.units_sold} sold</span></div>)}</div>}</CardContent></Card>
            <Card className="text-left"><CardHeader className="border-b"><CardTitle>Stock forecast</CardTitle><p className="text-sm text-muted-foreground">Projected coverage for the next 30 days</p></CardHeader><CardContent>{report.forecast.length===0?<div className="py-8"><p className="font-medium">Not enough sales data</p><p className="mt-1 text-sm text-muted-foreground">Forecasts appear as sales history builds.</p></div>:<div className="divide-y">{report.forecast.slice(0,8).map(item=><div key={item.variant_id} className="flex flex-col items-start justify-between gap-2 py-3 text-sm sm:flex-row sm:items-center"><div><p className="font-medium">{item.product_name} — {item.variant_name}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.current_stock} in stock · {item.days_of_cover===null?"No current sales velocity":`${item.days_of_cover} days of cover`}</p></div><span className={item.suggested_reorder?"rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300":"text-xs text-muted-foreground"}>{item.suggested_reorder?`Reorder ${item.suggested_reorder}`:"Stock sufficient"}</span></div>)}</div>}</CardContent></Card>
          </div>
        )}

        {orders.length === 0 && conversations.length === 0 && (
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Your analytics will grow with your shop</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sales and conversation data will appear here automatically once activity starts.
                </p>
              </div>
              <Link
                href={products.length === 0 ? "/products/new" : "/integrations"}
                className={buttonVariants({ size: "sm" })}
              >
                {products.length === 0 ? "Add a product" : "Connect a channel"}
              </Link>
            </CardContent>
          </Card>
        )}

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
              {lowStock.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Everything on sale is in stock.
                </p>
              ) : (
                <div className="divide-y">
                  {lowStock.map(({ product, variant }) => (
                    <div key={variant.id}
                         className="flex items-center justify-between py-2 text-sm">
                      <span className="truncate">{product.name} — {variant.name}</span>
                      {/* Still listed and still being offered by the
                          assistant, which is why this is worth surfacing. */}
                      <span className="shrink-0 text-xs text-destructive">
                        {variant.stock === 0 ? "Out of stock" : `${variant.stock} left`}
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
