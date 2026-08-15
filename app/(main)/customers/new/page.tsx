"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AppHeader from "@/components/header";
import CustomerForm from "@/components/customers/customer-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { CustomerFormValues } from "@/components/customers/customer-form/props";

export default function NewCustomerPage() {
  // ── Utils
  const router = useRouter();

  // ── API Integration
  const { createCustomer, loading } = useCustomersStore();

  // ── Methods
  async function handleSubmit(values: CustomerFormValues) {
    const customer = await createCustomer(values);
    if (customer) router.push("/customers");
  }

  // ── Render UI
  return (
    <>
      <AppHeader title="Add customer" description="Create a customer record for orders and rehearsals" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Link
          href="/customers"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to customers
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New customer</CardTitle>
            <CardDescription>
              Add a customer manually. Customers from Messenger or Telegram are
              created automatically when they message you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Add customer"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
