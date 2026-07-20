"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import AppHeader from "@/components/header";
import ProductTable from "@/components/products/product-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import SearchInput from "@/components/ui/search-input";
import {
  PRODUCTS_PAGE_SIZE,
  useProductsStore,
} from "@/stores/apis/products/products.store";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";

export default function ProductsPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("products");
  const tc = useT("common");

  // ── API Integration ────────────────────────────────────────────────────────
  const {
    products,
    total,
    page,
    loading,
    deleteProduct,
    updateProduct,
    fetchProducts,
  } = useProductsStore();

  // ── All States ─────────────────────────────────────────────────────────────
  // The API hides deactivated products by default, so this toggle is the only
  // way back to one once it has been paused.
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState("");

  // ── Effects ────────────────────────────────────────────────────────────────
  // Bound to both controls so changing either refetches — page 1, because the
  // row count changes and holding the old page could land past the end.
  const load = useCallback(
    (nextPage = 1) =>
      fetchProducts(nextPage, { includeInactive: showInactive, search }),
    [fetchProducts, showInactive, search]
  );

  useEffect(() => {
    load();
  }, [load]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    if (!(await deleteProduct(id))) return;

    // Refetch so the row vacated on this page is backfilled from the next one,
    // and so deleting the last item on the final page doesn't strand the seller
    // on an empty page.
    const lastPage = Math.max(1, Math.ceil((total - 1) / PRODUCTS_PAGE_SIZE));
    await load(Math.min(page, lastPage));
  }

  /**
   * Deactivating is the non-destructive counterpart to delete: the product
   * keeps its order history but drops out of the catalogue the AI quotes from,
   * which is what a seller actually wants for a sold-out or seasonal item.
   */
  async function handleToggleActive(id: string, isActive: boolean) {
    if (!(await updateProduct(id, { is_active: !isActive }))) return;
    // While hiding inactive rows, a just-deactivated product no longer belongs
    // on the page — refetch rather than leave a row that the filter excludes.
    await load(page);
  }

  // ── Conditional rendering ──────────────────────────────────────────────────
  if (loading && products.length === 0) {
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
          <div className="flex flex-1 items-center gap-3">
            <SearchInput
              onSearch={setSearch}
              placeholder={t.searchPlaceholder}
              clearLabel={tc.clearSearch}
              className="w-full max-w-xs"
            />
            <p className="shrink-0 text-sm text-muted-foreground">
              {/* Counts what the filters match, not the whole catalogue — with
                  a search active, the total IS the number of hits. */}
              {fmt(total === 1 ? t.countOne : t.countOther, { count: total })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showInactive ? "secondary" : "outline"}
              aria-pressed={showInactive}
              onClick={() => setShowInactive((v) => !v)}
            >
              {showInactive ? t.hideInactive : t.showInactive}
            </Button>
            <Link href="/products/new" className={buttonVariants({ size: "sm" })}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t.add}
            </Link>
          </div>
        </div>

        <ProductTable
          products={products}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          filtered={Boolean(search)}
          deleting={loading}
        />

        <Pagination
          page={page}
          pageSize={PRODUCTS_PAGE_SIZE}
          total={total}
          onPageChange={load}
          disabled={loading}
        />
      </main>
    </>
  );
}
