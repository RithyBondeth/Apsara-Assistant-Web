"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import AppHeader from "@/components/header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import {
  ORDER_STATUSES,
  ORDER_STATUS_STYLES,
} from "@/utils/constants/orders.constant";
import { OrderStatus } from "@/utils/interfaces/order/order.interface";
import { formatCurrency } from "@/utils/functions/currency";
import { formatDate } from "@/utils/functions/date";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OrderDetailClient id={id} />;
}

function OrderDetailClient({ id }: { id: string }) {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("orders");
  const tc = useT("common");

  // ── Utils ──────────────────────────────────────────────────────────────────
  const router = useRouter();

  // ── API Integration ────────────────────────────────────────────────────────
  const { selected, loading, error, fetchOrder, updateOrder, deleteOrder } =
    useOrdersStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { products, fetchProducts } = useProductsStore();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrder(id);
  }, [id, fetchOrder]);

  // ── Line items carry only product_id, so resolve names from the catalogue. ─
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [fetchCustomers, fetchProducts]);

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const customer = useMemo(
    () => customers.find((c) => c.id === selected?.customer_id),
    [customers, selected?.customer_id]
  );

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleStatusChange(next: OrderStatus) {
    if (
      next === "cancelled" &&
      !confirm(t.cancelConfirm)
    ) {
      return;
    }
    await updateOrder(id, { status: next });
  }

  async function handleDelete() {
    if (!confirm(t.deleteConfirm)) return;
    const ok = await deleteOrder(id);
    if (ok) router.push("/orders");
  }

  // ── Conditional rendering ──────────────────────────────────────────────────
  if (!selected) {
    return (
      <>
        <AppHeader title={t.title} />
        <main className="w-full flex-1 p-6">
          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : (
            <>
              <Skeleton className="mb-4 h-8 w-32" />
              <Skeleton className="h-96 rounded-xl" />
            </>
          )}
        </main>
      </>
    );
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={fmt(t.detailTitle, { id: selected.id.slice(0, 8) })} />

      <main className="w-full flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/orders"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "-ml-1",
            })}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t.back}
          </Link>

          <div className="flex items-center gap-2">
            {/* Changing to "cancelled" restocks every line item server-side. */}
            <select
              aria-label={t.statusLabel}
              value={selected.status}
              disabled={loading}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className={cn(
                "h-8 rounded-md border-0 px-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                ORDER_STATUS_STYLES[selected.status]
              )}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {tc.orderStatus[status]}
                </option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="icon"
              aria-label={t.deleteOrder}
              disabled={loading}
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* ── Items ────────────────────────────────────────────── */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t.detailItems}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.colProduct}</TableHead>
                    <TableHead className="w-20">{t.colQty}</TableHead>
                    <TableHead className="w-28">{t.colUnitPrice}</TableHead>
                    <TableHead className="w-28 text-right">{t.colSubtotal}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {/* A deleted product leaves the line intact — show the id. */}
                        {productMap[item.product_id]?.name ?? (
                          <span className="text-muted-foreground">
                            {fmt(t.deletedProduct, {
                              id: item.product_id.slice(0, 8),
                            })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  {fmt(t.totalItems, {
                    count: selected.items.reduce((s, i) => s + i.quantity, 0),
                  })}
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatCurrency(selected.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ── Meta ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.detailDetails}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <DetailRow label={t.colCustomer}>
                {customer ? (
                  <Link
                    href={`/customers/${customer.id}/edit`}
                    className="text-primary hover:underline"
                  >
                    {customer.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{tc.unknown}</span>
                )}
              </DetailRow>

              <DetailRow label={t.detailPlaced}>{formatDate(selected.created_at)}</DetailRow>

              <DetailRow label={t.detailAddress}>
                {selected.delivery_address ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>

              <DetailRow label={t.detailNotes}>
                {selected.notes ?? <span className="text-muted-foreground">—</span>}
              </DetailRow>

              {selected.conversation_id && (
                <DetailRow label={t.detailConversation}>
                  <Link href="/chat" className="text-primary hover:underline">
                    {t.viewChat}
                  </Link>
                </DetailRow>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="break-words">{children}</div>
    </div>
  );
}
