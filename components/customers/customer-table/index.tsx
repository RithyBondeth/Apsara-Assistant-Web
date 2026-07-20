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
import { formatDate } from "@/utils/functions/date";
import { PLATFORM_BY_ID } from "@/utils/constants/platforms.constant";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { useT } from "@/hooks/utils/use-translations";
import { ICustomerTableProps } from "./props";

const PLATFORM_COLORS: Record<PlatformId, string> = {
  telegram: "bg-sky-100 text-sky-700",
  messenger: "bg-blue-100 text-blue-700",
  instagram: "bg-pink-100 text-pink-700",
  website: "bg-green-100 text-green-700",
};

export default function CustomerTable({
  customers,
  onDelete,
  filtered,
  deleting,
}: ICustomerTableProps) {
  const t = useT("customers");
  const tc = useT("common");

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          {/* "Add your first customer" is wrong when the seller HAS customers
              and just filtered them all out — it reads as data loss. */}
          {filtered ? (
            tc.noMatches
          ) : (
            <>
              {t.emptyTitle}{" "}
              <Link
                href="/customers/new"
                className="font-medium underline-offset-4 hover:underline"
              >
                {t.emptyAction}
              </Link>
            </>
          )}
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
            <TableHead className="hidden sm:table-cell">{t.colContact}</TableHead>
            <TableHead className="hidden md:table-cell">{t.colPlatform}</TableHead>
            <TableHead className="hidden lg:table-cell">{t.colAdded}</TableHead>
            <TableHead className="w-24 text-right">{tc.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              {/* ── Name                   ────────────────────────────────────────── */}
              <TableCell>
                <p className="font-medium">{customer.name}</p>
                {customer.platform_id && (
                  <p className="text-xs text-muted-foreground">
                    ID: {customer.platform_id}
                  </p>
                )}
              </TableCell>

              {/* ── Contact                ────────────────────────────────────────── */}
              <TableCell className="hidden sm:table-cell">
                <div className="space-y-0.5">
                  {customer.phone && (
                    <p className="text-sm">{customer.phone}</p>
                  )}
                  {customer.email && (
                    <p className="text-xs text-muted-foreground">
                      {customer.email}
                    </p>
                  )}
                  {!customer.phone && !customer.email && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>

              {/* ── Platform               ────────────────────────────────────────── */}
              <TableCell className="hidden md:table-cell">
                {customer.platform ? (
                  /* Brand names are deliberately not translated. */
                  <Badge className={PLATFORM_COLORS[customer.platform] ?? ""}>
                    {PLATFORM_BY_ID[customer.platform]?.name ?? customer.platform}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>

              {/* ── Date                   ────────────────────────────────────────── */}
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {formatDate(customer.created_at)}
              </TableCell>

              {/* ── Actions                ────────────────────────────────────────── */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/customers/${customer.id}/edit`}
                    aria-label={`${tc.edit} ${customer.name}`}
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    aria-label={`${tc.delete} ${customer.name}`}
                    onClick={() => onDelete(customer.id)}
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
