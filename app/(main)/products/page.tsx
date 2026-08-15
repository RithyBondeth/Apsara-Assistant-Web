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

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  // ── API Integration
  const { products, loading, deleteProduct, fetchProducts } = useProductsStore();

  // ── Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Methods
  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
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
        <AppHeader title="Products" description="Manage what Apsara can recommend and sell" />
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
      <AppHeader title="Products" description="Manage what Apsara can recommend and sell" />

      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            {products.length > 0 && (
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search products"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="pl-8"
                />
              </div>
            )}
            <Link href="/products/new" className={buttonVariants({ size: "sm" })}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add product
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Build your product catalogue"
            description="Add names, prices, stock, and descriptions so Apsara can answer product questions accurately."
            action={{ label: "Add your first product", href: "/products/new" }}
          />
        ) : visibleProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching products"
            description={`Nothing matches “${query}”. Try a different name or description.`}
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
