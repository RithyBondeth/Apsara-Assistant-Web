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
import { ICustomerTableProps } from "./props";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  telegram: "bg-sky-100 text-sky-700",
  tiktok: "bg-pink-100 text-pink-700",
  website: "bg-green-100 text-green-700",
};

export default function CustomerTable({
  customers,
  onDelete,
  deleting,
}: ICustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-lg border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          No customers yet.{" "}
          <Link
            href="/customers/new"
            className="font-medium underline-offset-4 hover:underline"
          >
            Add your first customer
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
            <TableHead className="hidden sm:table-cell">Contact</TableHead>
            <TableHead className="hidden md:table-cell">Platform</TableHead>
            <TableHead className="hidden lg:table-cell">Added</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
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
                  <Badge
                    className={`capitalize ${PLATFORM_COLORS[customer.platform] ?? ""}`}
                  >
                    {customer.platform}
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
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
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
