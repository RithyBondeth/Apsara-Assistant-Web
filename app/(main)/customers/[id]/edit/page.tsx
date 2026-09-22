"use client";

import { use, useEffect } from "react";
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
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditCustomerClient id={id} />;
}

function EditCustomerClient({ id }: { id: string }) {
  // ── Utils
  const router = useRouter();
  const t = useAppT("customers").editPage;

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
        <AppHeader title={t.title} description={t.description} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="h-80 max-w-2xl rounded-xl" />
        </main>
      </>
    );
  }

  // ── Render UI
  return (
    <>
      <AppHeader title={t.title} description={t.description} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Link
          href="/customers"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.back}
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t.cardTitle}</CardTitle>
            <CardDescription>{fmt(t.updating, { name: selected.name })}</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm
              defaultValues={selected}
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel={t.submit}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
