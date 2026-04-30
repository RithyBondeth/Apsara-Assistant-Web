"use client";

import { useEffect } from "react";
import {
  Package,
  MessageCircle,
  ShoppingCart,
  Users,
} from "lucide-react";
import AppHeader from "@/components/header";
import StatCard from "@/components/dashboard/stat-card";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/utils/functions/date";

export default function DashboardPage() {
  // ── API Integration
  const { products, loading: productsLoading, fetchProducts } = useProductsStore();
  const {
    conversations,
    loading: chatLoading,
    fetchConversations,
  } = useChatStore();

  // ── Effects
  useEffect(() => {
    fetchProducts();
    fetchConversations();
  }, [fetchProducts, fetchConversations]);

  const loading = productsLoading || chatLoading;
  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);
  const recentConversations = conversations.slice(0, 5);

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
              icon={MessageCircle}
              label="Conversations"
              value={conversations.length}
              sub={`${totalUnread} unread`}
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders"
              value="—"
              sub="Coming soon"
            />
            <StatCard
              icon={Users}
              label="Customers"
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
            {chatLoading ? (
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
                {recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {conv.customer_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.last_message ?? "No messages yet"}
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      {conv.unread_count > 0 && (
                        <Badge variant="default" className="h-5 min-w-5 justify-center rounded-full px-1.5 text-xs">
                          {conv.unread_count}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {conv.last_message_at
                          ? timeAgo(conv.last_message_at)
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
