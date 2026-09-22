"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search } from "lucide-react";
import AppHeader from "@/components/header";
import ProductTable from "@/components/products/product-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/shared/empty-state";
import { useAppT, fmt, plural } from "@/hooks/utils/use-app-translations";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const t = useAppT("products");
  // ── API Integration
  const { products, loading, deleteProduct, fetchProducts } = useProductsStore();

  // ── Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Methods
  async function handleDelete(id: string) {
    if (!confirm(t.confirmDelete)) return;
    await deleteProduct(id);
  }

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [products, query]);

  // ── Conditional rendering
  if (loading && products.length === 0) {
    return (
      <>
        <AppHeader title={t.title} description={t.description} />
        <main className="space-y-4 p-4 sm:p-6 lg:p-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </main>
      </>
    );
  }

  // ── Render UI
  return (
    <>
      <AppHeader title={t.title} description={t.description} />

      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {plural(t.count, products.length)}
          </p>
          <div className="flex gap-2">
            {products.length > 0 && (
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label={t.search}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.search}
                  className="pl-8"
                />
              </div>
            )}
            <Link href="/products/new" className={buttonVariants({ size: "sm" })}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t.add}
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t.emptyTitle}
            description={t.emptyBody}
            action={{ label: t.addFirst, href: "/products/new" }}
          />
        ) : visibleProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t.noMatchTitle}
            description={fmt(t.noMatchBody, { query })}
            className="min-h-44"
          />
        ) : (
          <ProductTable
            products={visibleProducts}
            onDelete={handleDelete}
            deleting={loading}
          />
        )}
      </main>
    </>
  );
}
