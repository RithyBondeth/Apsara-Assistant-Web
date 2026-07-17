"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AppHeader from "@/components/header";
import OrderForm from "@/components/orders/order-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { useT } from "@/hooks/utils/use-translations";
import { OrderFormValues } from "@/components/orders/order-form/props";

export default function NewOrderPage() {
  // useSearchParams() requires a Suspense boundary in Next.js (matches the
  // pattern in (auth)/reset-password).
  return (
    <Suspense>
      <NewOrderForm />
    </Suspense>
  );
}

function NewOrderForm() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("orders");

  // ── Utils ──────────────────────────────────────────────────────────────────
  const router = useRouter();

  // Set when the order is being raised from a chat: fixes the customer and
  // links the order back to the thread it came out of.
  const params = useSearchParams();
  const fromCustomerId = params.get("customer") ?? undefined;
  const fromConversationId = params.get("conversation") ?? undefined;

  // ── API Integration ────────────────────────────────────────────────────────
  const { createOrder, loading, error, clearError } = useOrdersStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { products, fetchProducts } = useProductsStore();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [fetchCustomers, fetchProducts]);

  useEffect(() => clearError, [clearError]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleSubmit(values: OrderFormValues) {
    const order = await createOrder({
      customer_id: values.customer_id,
      conversation_id: fromConversationId,
      delivery_address: values.delivery_address || undefined,
      notes: values.notes || undefined,
      items: values.items,
    });
    if (order) router.push(`/orders/${order.id}`);
  }

  // Only lock the customer once we've confirmed they exist in the loaded list;
  // a stale link then degrades to the normal picker instead of an empty lock.
  const lockedCustomerId =
    fromCustomerId && customers.some((c) => c.id === fromCustomerId)
      ? fromCustomerId
      : undefined;

  // ── A seller with no customers or no products can't complete this form. ────
  // The customer check is skipped when one is prefilled from a conversation —
  // that customer already exists by definition.
  const blocker =
    customers.length === 0 && !lockedCustomerId
      ? { message: t.needCustomer, href: "/customers/new", label: t.needCustomerAction }
      : products.length === 0
        ? { message: t.needProduct, href: "/products/new", label: t.needProductAction }
        : null;

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.newTitle} />

      <main className="w-full flex-1 p-6">
        <Link
          href="/orders"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "mb-4 -ml-1",
          })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.back}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{t.newTitle}</CardTitle>
            <CardDescription>{t.newDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {blocker ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">{blocker.message}</p>
                <Link
                  href={blocker.href}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "mt-3",
                  })}
                >
                  {blocker.label}
                </Link>
              </div>
            ) : (
              <OrderForm
                customers={customers}
                products={products}
                onSubmit={handleSubmit}
                loading={loading}
                lockedCustomerId={lockedCustomerId}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
