"use client";

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
import { useProductsStore } from "@/stores/apis/products/products.store";
import { ProductFormValues } from "@/components/products/product-form/props";

export default function NewProductPage() {
  // ── Utils
  const router = useRouter();

  // ── API Integration
  const { createProduct, uploadImages, loading, error } = useProductsStore();

  // ── Methods
  async function handleSubmit(values: ProductFormValues, images: File[]) {
    const product = await createProduct(values);
    if (!product) return;
    if (images.length > 0) {
      const uploaded = await uploadImages(product.id, images);
      if (!uploaded) {
        router.push(`/products/${product.id}/edit`);
        return;
      }
    }
    router.push("/products");
  }

  // ── Render UI
  return (
    <>
      <AppHeader title="Add product" description="Teach Apsara what this item is, costs, and has in stock" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Link href="/products" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to products
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New product</CardTitle>
            <CardDescription>
              Add a product to your catalogue. The AI assistant will use this
              information to answer customer questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Add product"
              allowImageSelection
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
