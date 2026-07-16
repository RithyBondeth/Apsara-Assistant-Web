"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AppHeader from "@/components/header";
import ProductForm from "@/components/products/product-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { ProductFormValues } from "@/components/products/product-form/props";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditProductClient id={id} />;
}

function EditProductClient({ id }: { id: string }) {
  // ── Utils ──────────────────────────────────────────────────────────────────
  const router = useRouter();

  // ── API Integration ────────────────────────────────────────────────────────
  const { selected, loading, fetchProduct, updateProduct } = useProductsStore();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleSubmit(values: ProductFormValues) {
    const ok = await updateProduct(id, values);
    if (ok) router.push("/products");
  }

  // ── Conditional rendering ──────────────────────────────────────────────────
  if (loading || !selected) {
    return (
      <>
        <AppHeader title="Edit Product" />
        <main className="flex-1 p-6">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="h-96 max-w-2xl rounded-xl" />
        </main>
      </>
    );
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title="Edit Product" />

      <main className="flex-1 p-6">
        <Link
          href="/products"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "mb-4 -ml-1",
          })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to products
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit product</CardTitle>
            <CardDescription>
              Update &ldquo;{selected.name}&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
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
