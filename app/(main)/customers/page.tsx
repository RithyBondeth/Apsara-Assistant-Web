"use client";

import { useEffect } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import AppHeader from "@/components/header";
import CustomerTable from "@/components/customers/customer-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";

export default function CustomersPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("customers");

  // ── API Integration ────────────────────────────────────────────────────────
  const { customers, loading, fetchCustomers, deleteCustomer } = useCustomersStore();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    await deleteCustomer(id);
  }

  // ── Conditional rendering ──────────────────────────────────────────────────
  if (loading && customers.length === 0) {
    return (
      <>
        <AppHeader title={t.title} />
        <main className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </main>
      </>
    );
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {fmt(customers.length === 1 ? t.countOne : t.countOther, {
              count: customers.length,
            })}
          </p>
          <Link href="/customers/new" className={buttonVariants({ size: "sm" })}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            {t.add}
          </Link>
        </div>

        <CustomerTable
          customers={customers}
          onDelete={handleDelete}
          deleting={loading}
        />
      </main>
    </>
  );
}
