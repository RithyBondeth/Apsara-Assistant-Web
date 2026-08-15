"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Clock3, PackageCheck } from "lucide-react";
import AppHeader from "@/components/header";
import AdjustStockDialog from "@/components/inventory/adjust-stock-dialog";
import StatCard from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventoryStore } from "@/stores/apis/inventory/inventory.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { timeAgo } from "@/utils/functions/date";
import { IProduct } from "@/utils/interfaces/product/product.interface";

const MOVEMENT_LABELS: Record<string, string> = {
  opening_balance: "Opening balance",
  manual_adjustment: "Manual adjustment",
  reservation_created: "Reserved for order",
  reservation_reopened: "Reservation reopened",
  reservation_restored: "Reservation restored",
  reservation_fulfilled: "Order fulfilled",
  reservation_expired: "Reservation expired",
  order_cancelled: "Order cancelled",
  order_deleted: "Order deleted",
  order_reopened: "Order reopened",
  migration_snapshot: "Opening snapshot",
};

export default function InventoryPage() {
  const { products, loading: productsLoading, fetchProducts } = useProductsStore();
  const {
    movements,
    loading: inventoryLoading,
    error,
    fetchMovements,
    adjustStock,
    releaseExpired,
    clearError,
  } = useInventoryStore();
  const [selected, setSelected] = useState<IProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const released = await releaseExpired();
      if (active && released?.released_orders) {
        setReleaseMessage(
          `Released ${released.released_units} unit${released.released_units === 1 ? "" : "s"} from ${released.released_orders} expired order${released.released_orders === 1 ? "" : "s"}.`,
        );
      }
      await Promise.all([fetchProducts(), fetchMovements()]);
    }
    load();
    return () => { active = false; };
  }, [fetchMovements, fetchProducts, releaseExpired]);

  const summary = useMemo(() => {
    const active = products.filter((product) => product.is_active);
    return {
      available: active.reduce((sum, product) => sum + product.stock, 0),
      reserved: active.reduce((sum, product) => sum + product.reserved_stock, 0),
      low: active.filter((product) => product.stock <= product.low_stock_threshold),
    };
  }, [products]);

  async function handleAdjustment(quantityDelta: number, reason: string) {
    if (!selected) return false;
    const ok = await adjustStock(selected.id, { quantity_delta: quantityDelta, reason });
    if (ok) await Promise.all([fetchProducts(), fetchMovements()]);
    return ok;
  }

  function openAdjustment(product: IProduct) {
    clearError();
    setSelected(product);
    setDialogOpen(true);
  }

  const loading = productsLoading || inventoryLoading;
  if (loading && products.length === 0 && movements.length === 0) {
    return (
      <>
        <AppHeader title="Inventory" description="Track available, reserved, and adjusted stock" />
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Inventory" description="Track available, reserved, and adjusted stock" />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {releaseMessage && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            {releaseMessage}
          </div>
        )}
        {error && !dialogOpen && (
          <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={PackageCheck} label="Available" value={summary.available} sub="Ready to sell" />
          <StatCard icon={Clock3} label="Reserved" value={summary.reserved} sub="Held by open orders" />
          <StatCard icon={AlertTriangle} label="Low stock" value={summary.low.length} sub="At or below threshold" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stock levels</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Boxes className="mx-auto mb-3 h-8 w-8" />
                Add products before managing inventory.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead className="hidden sm:table-cell">Alert at</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const low = product.is_active && product.stock <= product.low_stock_threshold;
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.reserved_stock}</TableCell>
                          <TableCell className="hidden sm:table-cell">{product.low_stock_threshold}</TableCell>
                          <TableCell>
                            <Badge variant={low ? "destructive" : "secondary"}>
                              {low ? (product.stock === 0 ? "Out" : "Low") : "Healthy"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => openAdjustment(product)}>
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent movements</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No inventory movements yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Movement</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead className="hidden md:table-cell">Reason</TableHead>
                      <TableHead className="text-right">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => {
                      const product = products.find((item) => item.id === movement.product_id);
                      return (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">{product?.name ?? movement.product_name}</TableCell>
                          <TableCell>{MOVEMENT_LABELS[movement.kind] ?? movement.kind}</TableCell>
                          <TableCell className={movement.quantity_delta < 0 ? "text-destructive" : movement.quantity_delta > 0 ? "text-emerald-600" : "text-muted-foreground"}>
                            {movement.quantity_delta > 0 ? "+" : ""}{movement.quantity_delta}
                            <span className="ml-1 text-xs text-muted-foreground">→ {movement.balance_after}</span>
                          </TableCell>
                          <TableCell className="hidden max-w-64 truncate md:table-cell">{movement.reason ?? "—"}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{timeAgo(movement.created_at)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AdjustStockDialog
        product={selected}
        open={dialogOpen}
        loading={inventoryLoading}
        error={error}
        onOpenChange={setDialogOpen}
        onSubmit={handleAdjustment}
      />
    </>
  );
}
