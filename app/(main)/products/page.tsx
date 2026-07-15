"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import AppHeader from "@/components/header";
import ProductTable from "@/components/products/product-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsStore } from "@/stores/apis/products/products.store";

export default function ProductsPage() {
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

  // ── Conditional rendering
  if (loading && products.length === 0) {
    return (
      <>
        <AppHeader title="Products" />
        <main className="p-6 space-y-4">
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
      <AppHeader title="Products" />

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
          <Link href="/products/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </Link>
        </div>

        <ProductTable
          products={products}
          onDelete={handleDelete}
          deleting={loading}
        />
      </main>
    </>
  );
}
