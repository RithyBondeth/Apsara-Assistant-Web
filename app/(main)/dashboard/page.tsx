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
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  // ── API Integration
  // Counts come from the aggregate endpoint rather than from measuring
  // downloaded tables — customers and conversations are only fetched here for
  // the recent-conversations list below.
  const { stats, loading: statsLoading, fetchStats } = useDashboardStore();
  const { conversations, conversationsLoading, fetchConversations } = useChatStore();
  const { customers, fetchCustomers } = useCustomersStore();

  // ── Effects
  useEffect(() => {
    fetchStats();
    fetchConversations();
    fetchCustomers();
  }, [fetchStats, fetchConversations, fetchCustomers]);

  const recentConversations = conversations.slice(0, 5);
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  // ── Render UI
  return (
    <>
      <AppHeader title="Dashboard" />

      <main className="flex-1 space-y-6 p-6">
        {/* ── Stat cards */}
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
              label="Revenue"
              value={formatCurrency(stats?.revenue ?? 0)}
              sub="Excluding cancelled"
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders"
              value={stats?.orders ?? 0}
              sub={`${stats?.pending_orders ?? 0} pending`}
            />
            <StatCard
              icon={MessageCircle}
              label="Conversations"
              value={stats?.conversations ?? 0}
              sub={`${stats?.open_conversations ?? 0} open`}
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={stats?.customers ?? 0}
              sub="All platforms"
            />
            <StatCard
              icon={Package}
              label="Products"
              value={stats?.products ?? 0}
              sub="Active in catalogue"
            />
          </div>
        )}

        {/* ── Recent conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Conversations</CardTitle>
            <Link
              href="/chat"
              className="text-xs font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              View all
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
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <Link
                  href="/channels"
                  className="mt-1 inline-block text-xs font-medium text-blue-600 underline-offset-4 hover:underline"
                >
                  Connect a channel to start receiving messages
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
