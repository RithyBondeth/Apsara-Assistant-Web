"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Package, MessageCircle, ShoppingCart, Users } from "lucide-react";
import AppHeader from "@/components/header";
import StatCard from "@/components/dashboard/stat-card";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/utils/functions/date";
import { formatMoney } from "@/utils/functions/money";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { useOperationsStore } from "@/stores/apis/operations/operations.store";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  // ── API Integration
  const { products, loading: productsLoading, fetchProducts } = useProductsStore();
  const { conversations, conversationsLoading, fetchConversations } = useChatStore();
  const { customers, loading: customersLoading, fetchCustomers } = useCustomersStore();
  const { orders, loading: ordersLoading, fetchOrders } = useOrdersStore();
  const { alerts, fetchAlerts } = useOperationsStore();

  // ── Effects
  useEffect(() => {
    fetchProducts();
    fetchConversations();
    fetchCustomers();
    fetchOrders();
    fetchAlerts();
  }, [fetchProducts, fetchConversations, fetchCustomers, fetchOrders, fetchAlerts]);

  const loading = productsLoading || conversationsLoading || customersLoading || ordersLoading;
  const openConversations = conversations.filter((c) => c.status === "open").length;
  const recentConversations = conversations.slice(0, 5);
  // Cancelled orders are still records but not revenue, so they are excluded.
  // Totalled per currency rather than summed outright: orders keep whatever
  // the shop traded in when they were placed, and adding riel to dollars
  // would produce a confident, meaningless number.
  const revenueByCurrency = orders
    .filter((o) => o.status !== "cancelled")
    .reduce<Record<string, number>>((totals, order) => {
      totals[order.currency] =
        (totals[order.currency] ?? 0) + parseFloat(order.total_amount);
      return totals;
    }, {});
  const currencies = Object.keys(revenueByCurrency);
  const revenue = currencies
    .map((code) => formatMoney(revenueByCurrency[code], code))
    .join(" · ");

  // ── Build customer lookup
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  // ── Render UI
  return (
    <>
      <AppHeader
        title="Dashboard"
        description="A quick pulse check on your shop and customer activity"
      />

      <main className="flex-1 space-y-6 p-4 text-left sm:p-6 lg:p-8">
        {/* ── Stat cards */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Package}
              label="Total Products"
              value={products.length}
              sub="In your catalogue"
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={customers.length}
              sub="All platforms"
            />
            <StatCard
              icon={MessageCircle}
              label="Conversations"
              value={conversations.length}
              sub={`${openConversations} open`}
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders"
              value={orders.length}
              sub={revenue ? `${revenue} excl. cancelled` : "No revenue yet"}
            />
          </div>
        )}

        {!loading &&
          products.length === 0 &&
          customers.length === 0 &&
          conversations.length === 0 && (
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="font-semibold">Get your shop ready for its first conversation</p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Add what you sell, connect a channel, then test how Apsara answers a customer.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/products/new" className={buttonVariants({ size: "sm" })}>
                    Add a product
                  </Link>
                  <Link
                    href="/integrations"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Connect a channel
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

        {alerts.length > 0 && (
          <Card className="border-amber-300/70 bg-amber-50/60 text-left dark:bg-amber-950/20">
            <CardHeader className="border-b border-amber-200/70 sm:grid-cols-[1fr_auto]">
              <CardTitle className="flex items-center gap-2"><span className="rounded-md bg-amber-100 p-1.5 dark:bg-amber-950"><AlertTriangle className="size-4 text-amber-700 dark:text-amber-400"/></span>Stock needs attention</CardTitle>
              <p className="text-sm text-muted-foreground">{alerts.length} variant{alerts.length === 1 ? "" : "s"} at or below threshold</p>
              <Link href="/purchasing" className="text-sm font-medium text-primary hover:underline sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-center">Create purchase order</Link>
            </CardHeader>
            <CardContent className="divide-y">
              {alerts.slice(0,5).map(alert=><div key={alert.id} className="flex flex-col items-start justify-between gap-1 py-3 text-sm sm:flex-row sm:items-center"><span className="font-medium">{alert.product_name} — {alert.variant_name}</span><span className="text-amber-800 dark:text-amber-300"><strong>{alert.stock}</strong> left · alert at {alert.threshold}</span></div>)}
            </CardContent>
          </Card>
        )}

        {/* ── Recent conversations */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent conversations</CardTitle>
            {recentConversations.length > 0 && (
              <Link
                href="/chat"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {conversationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recentConversations.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No conversations yet"
                description="Add a customer to rehearse a sales conversation, or connect a channel to receive real messages."
                action={{ label: "Add a customer", href: "/customers/new" }}
                className="min-h-48 border-0 bg-transparent py-6"
              />
            ) : (
              <div className="divide-y">
                {recentConversations.map((conv) => {
                  const customer = customerMap[conv.customer_id];
                  return (
                    <div key={conv.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {customer?.name ?? `Customer ${conv.customer_id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {conv.platform}
                        </p>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-2">
                        <Badge className={cn("capitalize text-[10px]", STATUS_STYLES[conv.status])}>
                          {conv.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(conv.updated_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
