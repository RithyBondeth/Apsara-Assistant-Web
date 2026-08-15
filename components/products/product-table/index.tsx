"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatMoney } from "@/utils/functions/money";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { IProductTableProps } from "./props";

export default function ProductTable({
  products,
  onDelete,
  deleting,
}: IProductTableProps) {
  // Products are priced in whatever the shop currently trades in.
  const currency = useAuthStore((s) => s.user?.currency);

  if (products.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          No products yet.{" "}
          <Link href="/products/new" className="font-medium underline-offset-4 hover:underline">
            Add your first product
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Price</TableHead>
            <TableHead className="hidden md:table-cell">Stock</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {product.images?.[0] || product.image_url ? (
                    // Uploaded media URLs are dynamic API resources.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images?.find((image) => image.is_primary)?.url ?? product.images?.[0]?.url ?? product.image_url ?? ""}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                      {formatMoney(product.price, currency)} · {product.stock} in stock
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatMoney(product.price, currency)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {product.stock}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/products/${product.id}/edit`}
                    aria-label={`Edit ${product.name}`}
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    onClick={() => onDelete(product.id)}
                    aria-label={`Delete ${product.name}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
