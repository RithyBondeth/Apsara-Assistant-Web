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
import { useT } from "@/hooks/utils/use-translations";
import { CustomerFormValues } from "@/components/customers/customer-form/props";

export default function NewCustomerPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("customers");

  // ── Utils ──────────────────────────────────────────────────────────────────
  const router = useRouter();

  // ── API Integration ────────────────────────────────────────────────────────
  const { createCustomer, loading } = useCustomersStore();

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleSubmit(values: CustomerFormValues) {
    const customer = await createCustomer({
      ...values,
      // "" is the "not tied to a channel" option; omit rather than send it.
      platform: values.platform || undefined,
    });
    if (customer) router.push("/customers");
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.add} />

      <main className="flex-1 p-6">
        <Link
          href="/customers"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.back}
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t.newTitle}</CardTitle>
            <CardDescription>{t.newDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel={t.add}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
