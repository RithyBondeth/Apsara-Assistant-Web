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
import { useT } from "@/hooks/utils/use-translations";
import { ProductFormValues } from "@/components/products/product-form/props";

export default function NewProductPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("products");

  // ── Utils ──────────────────────────────────────────────────────────────────
  const router = useRouter();

  // ── API Integration ────────────────────────────────────────────────────────
  const { createProduct, loading } = useProductsStore();

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleSubmit(values: ProductFormValues) {
    const ok = await createProduct(values);
    if (ok) router.push("/products");
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.add} />

      <main className="flex-1 p-6">
        <Link href="/products" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-1" })}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.back}
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t.newTitle}</CardTitle>
            <CardDescription>{t.newDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel={t.add}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
