"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Package, MessageCircle, ShoppingCart, Users, DollarSign } from "lucide-react";
import AppHeader from "@/components/header";
import StatCard from "@/components/dashboard/stat-card";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useDashboardStore } from "@/stores/apis/dashboard/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/utils/functions/date";
import { formatCurrency } from "@/utils/functions/currency";
import { fmt } from "@/utils/functions/i18n";
import { PLATFORM_BY_ID } from "@/utils/constants/platforms.constant";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("dashboard");
  const tc = useT("common");

  // ── API Integration ────────────────────────────────────────────────────────
  // Counts come from the aggregate endpoint rather than from measuring
  // downloaded tables — customers and conversations are only fetched here for
  // the recent-conversations list below.
  const { stats, loading: statsLoading, fetchStats } = useDashboardStore();
  const { conversations, conversationsLoading, fetchConversations } = useChatStore();
  const { customers, fetchCustomers } = useCustomersStore();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchConversations();
    fetchCustomers();
  }, [fetchStats, fetchConversations, fetchCustomers]);

  const recentConversations = conversations.slice(0, 5);
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex-1 space-y-6 p-6">
      {/* ── Stat Cards ──────────────────────────────────────────── */}
        {statsLoading && !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={DollarSign}
              label={t.revenue}
              value={formatCurrency(stats?.revenue ?? 0)}
              sub={t.revenueSub}
            />
            <StatCard
              icon={ShoppingCart}
              label={t.orders}
              value={stats?.orders ?? 0}
              sub={fmt(t.ordersSub, { count: stats?.pending_orders ?? 0 })}
            />
            <StatCard
              icon={MessageCircle}
              label={t.conversations}
              value={stats?.conversations ?? 0}
              sub={fmt(t.conversationsSub, {
                count: stats?.open_conversations ?? 0,
              })}
            />
            <StatCard
              icon={Users}
              label={t.customers}
              value={stats?.customers ?? 0}
              sub={t.customersSub}
            />
            <StatCard
              icon={Package}
              label={t.products}
              value={stats?.products ?? 0}
              sub={t.productsSub}
            />
          </div>
        )}

        {/* ── Recent Conversations ──────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{t.recentTitle}</CardTitle>
            <Link
              href="/chat"
              className="text-xs font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              {t.viewAll}
            </Link>
          </CardHeader>
          <CardContent>
            {conversationsLoading && recentConversations.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t.noConversations}
                </p>
                <Link
                  href="/channels"
                  className="mt-1 inline-block text-xs font-medium text-blue-600 underline-offset-4 hover:underline"
                >
                  {t.connectChannel}
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentConversations.map((conv) => {
                  const customer = customerMap[conv.customer_id];
                  return (
                    <div key={conv.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {customer?.name ??
                            fmt(t.customerFallback, {
                              id: conv.customer_id.slice(0, 8),
                            })}
                        </p>
                        {/* Brand names are deliberately not translated. */}
                        <p className="text-xs text-muted-foreground">
                          {PLATFORM_BY_ID[conv.platform]?.name ?? conv.platform}
                        </p>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-2">
                        <Badge className={cn("text-[10px]", STATUS_STYLES[conv.status])}>
                          {tc.conversationStatus[conv.status]}
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
