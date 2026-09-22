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
import { useAppT, fmt, plural } from "@/hooks/utils/use-app-translations";

export default function AnalyticsPage() {
  const t = useAppT("analytics");
  const orderT = useAppT("orders");
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
        label: products.find((p) => p.id === id)?.name ?? fmt(t.productFallback, { id: id.slice(0, 8) }),
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
  }, [orders, conversations, products, t.productFallback]);

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
        <AppHeader title={t.title} description={t.description} />
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
      <AppHeader title={t.title} description={t.description} />

      <main className="flex-1 space-y-6 p-4 text-left sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label={t.revenue}
            value={revenueLabel}
            sub={plural(t.ordersExcl, stats.sold.length)}
          />
          <StatCard
            icon={Package}
            label={t.averageOrder}
            value={
              stats.averages
                .map((a) => formatMoney(a.value, a.currency))
                .join(" · ") || "—"
            }
            sub={t.perCurrency}
          />
          <StatCard
            icon={Users}
            label={t.customers}
            value={customers.length}
            sub={customers.length === 0 ? t.noCustomers : t.knownCustomers}
          />
          <StatCard
            icon={MessageCircle}
            label={t.conversations}
            value={conversations.length}
            sub={fmt(t.open, { count: conversations.filter((c) => c.status === "open").length })}
          />
        </div>

        {report && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="text-left"><CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><TrendingUp className="size-4 text-primary"/>{t.bestSellers}</CardTitle><p className="text-sm text-muted-foreground">{t.unitsLast30}</p></CardHeader><CardContent>{report.best_sellers.length===0?<div className="py-8"><p className="font-medium">{t.noSalesTitle}</p><p className="mt-1 text-sm text-muted-foreground">{t.noSalesBody}</p></div>:<div className="divide-y">{report.best_sellers.slice(0,8).map((item,index)=><div key={item.variant_id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 py-3 text-sm"><span className="text-xs font-semibold text-muted-foreground">{String(index+1).padStart(2,"0")}</span><div><p className="font-medium">{item.product_name}</p><p className="text-xs text-muted-foreground">{item.variant_name}</p></div><span className="font-medium tabular-nums">{fmt(t.sold, { count: item.units_sold })}</span></div>)}</div>}</CardContent></Card>
            <Card className="text-left"><CardHeader className="border-b"><CardTitle>{t.forecast}</CardTitle><p className="text-sm text-muted-foreground">{t.forecastHelp}</p></CardHeader><CardContent>{report.forecast.length===0?<div className="py-8"><p className="font-medium">{t.notEnoughTitle}</p><p className="mt-1 text-sm text-muted-foreground">{t.notEnoughBody}</p></div>:<div className="divide-y">{report.forecast.slice(0,8).map(item=><div key={item.variant_id} className="flex flex-col items-start justify-between gap-2 py-3 text-sm sm:flex-row sm:items-center"><div><p className="font-medium">{item.product_name} — {item.variant_name}</p><p className="mt-0.5 text-xs text-muted-foreground">{fmt(t.inStock, { count: item.current_stock })} · {item.days_of_cover===null?t.noVelocity:fmt(t.daysOfCover, { days: item.days_of_cover })}</p></div><span className={item.suggested_reorder?"rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300":"text-xs text-muted-foreground"}>{item.suggested_reorder?fmt(t.reorder, { count: item.suggested_reorder }):t.sufficient}</span></div>)}</div>}</CardContent></Card>
          </div>
        )}

        {orders.length === 0 && conversations.length === 0 && (
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{t.growTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.growBody}</p>
              </div>
              <Link
                href={products.length === 0 ? "/products/new" : "/integrations"}
                className={buttonVariants({ size: "sm" })}
              >
                {products.length === 0 ? t.addProduct : t.connectChannel}
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownCard
            title={t.ordersByStatus}
            rows={Object.entries(stats.byStatus).map(([status, count]) => ({
              key: status,
              label: orderT.status[status as TOrderStatus] ?? status,
              value: count,
              badgeClass: ORDER_STATUS_STYLES[status as TOrderStatus],
            }))}
            empty={t.noOrders}
          />

          <BreakdownCard
            title={t.byChannel}
            rows={Object.entries(stats.byPlatform).map(([platform, count]) => ({
              key: platform,
              label: t.platforms[platform as keyof typeof t.platforms] ?? platform,
              value: count,
            }))}
            capitalizeLabels
            empty={t.noConversations}
          />

          <BreakdownCard
            title={t.bestSellers}
            // Product names are left alone: capitalising them would rewrite
            // the seller's own spelling.
            rows={stats.topProducts}
            unit={t.units}
            empty={t.nothingSold}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.needsRestocking}</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t.allInStock}
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
                        {variant.stock === 0 ? t.outOfStock : fmt(t.left, { count: variant.stock })}
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
