"use client";

import { useEffect } from "react";
import { Package, MessageCircle, ShoppingCart, Users } from "lucide-react";
import AppHeader from "@/components/header";
import StatCard from "@/components/dashboard/stat-card";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/utils/functions/date";
import { cn } from "@/lib/utils";

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

  // ── Effects
  useEffect(() => {
    fetchProducts();
    fetchConversations();
    fetchCustomers();
  }, [fetchProducts, fetchConversations, fetchCustomers]);

  const loading = productsLoading || conversationsLoading || customersLoading;
  const openConversations = conversations.filter((c) => c.status === "open").length;
  const recentConversations = conversations.slice(0, 5);

  // ── Build customer lookup
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  // ── Render UI
  return (
    <>
      <AppHeader title="Dashboard" />

      <main className="flex-1 space-y-6 p-6">
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
              value="—"
              sub="Coming soon"
            />
          </div>
        )}

        {/* ── Recent conversations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {conversationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recentConversations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
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
