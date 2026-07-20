"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import AppHeader from "@/components/header";
import CustomerTable from "@/components/customers/customer-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import SearchInput from "@/components/ui/search-input";
import PlatformFilter from "@/components/ui/platform-filter";
import {
  CUSTOMERS_PAGE_SIZE,
  useCustomersStore,
} from "@/stores/apis/customers/customers.store";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";

export default function CustomersPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("customers");
  const tc = useT("common");

  // ── API Integration ────────────────────────────────────────────────────────
  const { customers, total, page, loading, fetchCustomers, deleteCustomer } =
    useCustomersStore();

  // ── All States ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<PlatformId | "">("");

  // ── Effects ────────────────────────────────────────────────────────────────
  // Refetches whenever either control changes. Back to page 1 each time: the
  // match count changes, so the current page number may no longer exist.
  const load = useCallback(
    (nextPage = 1) =>
      fetchCustomers(nextPage, { search, platform: platform || undefined }),
    [fetchCustomers, search, platform]
  );

  useEffect(() => {
    load();
  }, [load]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    if (!(await deleteCustomer(id))) return;

    // Refetch so the vacated row is backfilled from the next page, and so
    // deleting the last row on the final page doesn't strand an empty view.
    const lastPage = Math.max(1, Math.ceil((total - 1) / CUSTOMERS_PAGE_SIZE));
    await load(Math.min(page, lastPage));
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <SearchInput
              onSearch={setSearch}
              placeholder={t.searchPlaceholder}
              clearLabel={tc.clearSearch}
              className="w-full max-w-xs"
            />
            <PlatformFilter
              value={platform}
              onChange={setPlatform}
              allLabel={tc.allPlatforms}
            />
            <p className="shrink-0 text-sm text-muted-foreground">
              {/* What the filters match — with a search or channel active this
                  is the number of hits, not the seller's whole list. */}
              {fmt(total === 1 ? t.countOne : t.countOther, { count: total })}
            </p>
          </div>
          <Link href="/customers/new" className={buttonVariants({ size: "sm" })}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            {t.add}
          </Link>
        </div>

        <CustomerTable
          customers={customers}
          onDelete={handleDelete}
          filtered={Boolean(search || platform)}
          deleting={loading}
        />

        <Pagination
          page={page}
          pageSize={CUSTOMERS_PAGE_SIZE}
          total={total}
          onPageChange={load}
          disabled={loading}
        />
      </main>
    </>
  );
}
