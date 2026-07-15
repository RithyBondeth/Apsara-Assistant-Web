"use client";

import { useEffect, useMemo } from "react";
import { DollarSign, ShoppingCart, MessageCircle, Users } from "lucide-react";
import AppHeader from "@/components/header";
import StatCard from "@/components/dashboard/stat-card";
import BreakdownBar from "@/components/analytics/breakdown-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/stores/apis/dashboard/dashboard.store";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { ORDER_STATUSES, ORDER_STATUS_BAR } from "@/utils/constants/orders.constant";
import { PLATFORMS } from "@/utils/constants/platforms.constant";
import { formatCurrency } from "@/utils/functions/currency";

export default function AnalyticsPage() {
  // ── API Integration
  const { stats, loading: statsLoading, fetchStats } = useDashboardStore();
  const { orders, fetchOrders } = useOrdersStore();
  const { conversations, fetchConversations } = useChatStore();

  // ── Effects
  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchConversations();
  }, [fetchStats, fetchOrders, fetchConversations]);

  // ── Breakdowns are derived client-side: the API exposes snapshot totals, not
  // a grouped/time-series endpoint. The orders list is capped at 50 server-side,
  // so this reflects the most recent orders rather than all history.
  const ordersByStatus = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        label: status,
        value: orders.filter((o) => o.status === status).length,
        className: ORDER_STATUS_BAR[status],
      })),
    [orders]
  );

  const conversationsByPlatform = useMemo(
    () =>
      PLATFORMS.map((platform) => ({
        label: platform.name,
        value: conversations.filter((c) => c.platform === platform.id).length,
      })),
    [conversations]
  );

  const averageOrder = useMemo(() => {
    const billable = orders.filter((o) => o.status !== "cancelled");
    if (billable.length === 0) return 0;
    const total = billable.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    return total / billable.length;
  }, [orders]);

  // ── Render UI
  return (
    <>
      <AppHeader title="Analytics" />

      <main className="flex-1 space-y-6 p-6">
        {statsLoading && !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={formatCurrency(stats?.revenue ?? 0)}
              sub="Excluding cancelled"
            />
            <StatCard
              icon={ShoppingCart}
              label="Average order"
              value={formatCurrency(averageOrder)}
              sub="Across recent orders"
            />
            <StatCard
              icon={MessageCircle}
              label="Conversations"
              value={stats?.conversations ?? 0}
              sub={`${stats?.open_conversations ?? 0} still open`}
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={stats?.customers ?? 0}
              sub="All platforms"
            />
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Orders by status</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownBar
                rows={ordersByStatus}
                emptyLabel="No orders yet."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversations by channel</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownBar
                rows={conversationsByPlatform}
                emptyLabel="No conversations yet. Connect a channel to start receiving messages."
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
