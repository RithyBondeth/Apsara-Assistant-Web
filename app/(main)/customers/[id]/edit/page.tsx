"use client";

import { useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { CustomerFormValues } from "@/components/customers/customer-form/props";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCustomerClient id={id} />;
}

function EditCustomerClient({ id }: { id: string }) {
  // ── Utils
  const router = useRouter();

  // ── API Integration
  const { selected, loading, fetchCustomer, updateCustomer } = useCustomersStore();

  // ── Effects
  useEffect(() => {
    fetchCustomer(id);
  }, [id, fetchCustomer]);

  // ── Methods
  async function handleSubmit(values: CustomerFormValues) {
    const ok = await updateCustomer(id, {
      name: values.name,
      phone: values.phone,
      email: values.email,
    });
    if (ok) router.push("/customers");
  }

  // ── Conditional rendering
  if (loading || !selected) {
    return (
      <>
        <AppHeader title="Edit Customer" />
        <main className="flex-1 p-6">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="h-80 max-w-2xl rounded-xl" />
        </main>
      </>
    );
  }

  // ── Render UI
  return (
    <>
      <AppHeader title="Edit Customer" />

      <main className="flex-1 p-6">
        <Link
          href="/customers"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to customers
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit customer</CardTitle>
            <CardDescription>
              Updating &ldquo;{selected.name}&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm
              defaultValues={selected}
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
