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
import { useAppT } from "@/hooks/utils/use-app-translations";

export default function NewProductPage() {
  // ── Utils
  const router = useRouter();
  const t = useAppT("products").newPage;

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
      <AppHeader title={t.title} description={t.description} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Link href="/products" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.back}
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t.cardTitle}</CardTitle>
            <CardDescription>{t.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel={t.submit}
              allowImageSelection
              allowVariantSelection
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
