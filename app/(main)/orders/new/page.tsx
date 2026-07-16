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
import { OrderFormValues } from "@/components/orders/order-form/props";

export default function NewOrderPage() {
  // ── Utils
  const router = useRouter();

  // ── API Integration
  const { createOrder, loading, error, clearError } = useOrdersStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { products, fetchProducts } = useProductsStore();

  // ── Effects
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [fetchCustomers, fetchProducts]);

  useEffect(() => clearError, [clearError]);

  // ── Methods
  async function handleSubmit(values: OrderFormValues) {
    const order = await createOrder({
      customer_id: values.customer_id,
      delivery_address: values.delivery_address || undefined,
      notes: values.notes || undefined,
      items: values.items,
    });
    if (order) router.push(`/orders/${order.id}`);
  }

  // ── A seller with no customers or no products can't complete this form.
  const blocker =
    customers.length === 0
      ? { message: "Add a customer before creating an order.", href: "/customers/new", label: "Add customer" }
      : products.length === 0
        ? { message: "Add a product before creating an order.", href: "/products/new", label: "Add product" }
        : null;

  // ── Render UI
  return (
    <>
      <AppHeader title="New Order" />

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
          Back to orders
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>New order</CardTitle>
            <CardDescription>
              Record an order manually. Each line is priced from the product&apos;s
              current price, and stock is reduced when the order is created.
            </CardDescription>
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
