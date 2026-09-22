"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AppHeader from "@/components/header";
import ProductForm from "@/components/products/product-form";
import ProductImageManager from "@/components/products/product-image-manager";
import ProductVariantManager from "@/components/products/product-variant-manager";
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
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditProductClient id={id} />;
}

function EditProductClient({ id }: { id: string }) {
  // ── Utils
  const router = useRouter();
  const t = useAppT("products").editPage;

  // ── API Integration
  const { selected, loading, fetchProduct, updateProduct } = useProductsStore();

  // ── Effects
  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  // ── Methods
  async function handleSubmit(values: ProductFormValues) {
    const payload = selected && selected.variants.length > 1
      ? { name: values.name, description: values.description }
      : values;
    const ok = await updateProduct(id, payload);
    if (ok) router.push("/products");
  }

  // ── Conditional rendering
  if (!selected) {
    return (
      <>
        <AppHeader title={t.title} description={t.description} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="h-96 max-w-2xl rounded-xl" />
        </main>
      </>
    );
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
            <CardDescription>{fmt(t.updating, { name: selected.name })}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              defaultValues={selected}
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel={t.submit}
              allowStockEditing={false}
            />
          </CardContent>
        </Card>

        <Card className="mt-6 max-w-2xl">
          <CardHeader>
            <CardTitle>{t.variantsTitle}</CardTitle>
            <CardDescription>{t.variantsDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductVariantManager productId={selected.id} variants={selected.variants} />
          </CardContent>
        </Card>

        <Card className="mt-6 max-w-2xl">
          <CardHeader>
            <CardTitle>{t.imagesTitle}</CardTitle>
            <CardDescription>{t.imagesDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageManager
              productId={selected.id}
              images={selected.images}
              variants={selected.variants}
              legacyImageUrl={selected.image_url}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
