"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";

interface IPaginationProps {
  /** 1-based. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}: IPaginationProps) {
  const t = useT("common");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // A single page needs no controls — but the caller still renders the count
  // above the table, so there's no loss of information in hiding this.
  if (total <= pageSize) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        {fmt(t.pagination.range, { from: first, to: last, total })}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t.pagination.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t.pagination.next}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
