"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IProduct, IProductVariant } from "@/utils/interfaces/product/product.interface";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

interface AdjustStockDialogProps {
  product: IProduct | null;
  variant: IProductVariant | null;
  open: boolean;
  loading: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (quantityDelta: number, reason: string) => Promise<boolean>;
}

export default function AdjustStockDialog({
  product,
  variant,
  open,
  loading,
  error,
  onOpenChange,
  onSubmit,
}: AdjustStockDialogProps) {
  const [direction, setDirection] = useState("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const t = useAppT("inventory").dialog;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setDirection("add");
      setQuantity(1);
      setReason("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !variant || quantity < 1 || reason.trim().length < 3) return;
    const ok = await onSubmit(direction === "remove" ? -quantity : quantity, reason.trim());
    if (ok) handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>
            {product && variant
              ? fmt(t.current, { product: product.name, variant: variant.name, stock: variant.stock, reserved: variant.reserved_stock })
              : t.generic}
          </DialogDescription>
        </DialogHeader>

        <form id="stock-adjustment-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="adjustment-direction">{t.adjustment}</Label>
            <Select value={direction} onValueChange={(value) => value && setDirection(value)}>
              <SelectTrigger id="adjustment-direction" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">{t.addStock}</SelectItem>
                <SelectItem value="remove">{t.removeStock}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjustment-quantity">{t.quantity}</Label>
            <Input
              id="adjustment-quantity"
              type="number"
              min="1"
              max={direction === "remove" ? variant?.stock : undefined}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjustment-reason">{t.reason}</Label>
            <Input
              id="adjustment-reason"
              value={reason}
              minLength={3}
              maxLength={500}
              placeholder={t.reasonPlaceholder}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </form>

        <DialogFooter showCloseButton>
          <Button
            form="stock-adjustment-form"
            type="submit"
            disabled={loading || !product || !variant || quantity < 1 || reason.trim().length < 3}
          >
            {loading ? t.saving : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
