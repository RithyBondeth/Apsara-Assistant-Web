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
import { useT } from "@/hooks/utils/use-translations";
import { IProductTableProps } from "./props";

export default function ProductTable({
  products,
  onDelete,
  deleting,
}: IProductTableProps) {
  const t = useT("products");
  const tc = useT("common");

  if (products.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t.emptyTitle}{" "}
          <Link href="/products/new" className="font-medium underline-offset-4 hover:underline">
            {t.emptyAction}
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
            <TableHead>{t.colName}</TableHead>
            <TableHead className="hidden sm:table-cell">{t.colPrice}</TableHead>
            <TableHead className="hidden md:table-cell">{t.colStock}</TableHead>
            <TableHead className="hidden lg:table-cell">{t.colStatus}</TableHead>
            <TableHead className="w-24 text-right">{tc.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <p className="font-medium">{product.name}</p>
                {product.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {product.description}
                  </p>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                ${parseFloat(product.price).toFixed(2)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {product.stock}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? t.active : t.inactive}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/products/${product.id}/edit`}
                    aria-label={`${tc.edit} ${product.name}`}
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    aria-label={`${tc.delete} ${product.name}`}
                    onClick={() => onDelete(product.id)}
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
