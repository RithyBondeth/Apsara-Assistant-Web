"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("orders");

  // ── Utils ──────────────────────────────────────────────────────────────────
  const router = useRouter();

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
      delivery_address: values.delivery_address || undefined,
      notes: values.notes || undefined,
      items: values.items,
    });
    if (order) router.push(`/orders/${order.id}`);
  }

  // ── A seller with no customers or no products can't complete this form. ────
  const blocker =
    customers.length === 0
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
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
