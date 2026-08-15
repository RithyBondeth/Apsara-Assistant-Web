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
import { IProduct } from "@/utils/interfaces/product/product.interface";

interface AdjustStockDialogProps {
  product: IProduct | null;
  open: boolean;
  loading: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (quantityDelta: number, reason: string) => Promise<boolean>;
}

export default function AdjustStockDialog({
  product,
  open,
  loading,
  error,
  onOpenChange,
  onSubmit,
}: AdjustStockDialogProps) {
  const [direction, setDirection] = useState("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

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
    if (!product || quantity < 1 || reason.trim().length < 3) return;
    const ok = await onSubmit(direction === "remove" ? -quantity : quantity, reason.trim());
    if (ok) handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {product
              ? `${product.name} currently has ${product.stock} available and ${product.reserved_stock} reserved.`
              : "Record a received, damaged, returned, or corrected quantity."}
          </DialogDescription>
        </DialogHeader>

        <form id="stock-adjustment-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="adjustment-direction">Adjustment</Label>
            <Select value={direction} onValueChange={(value) => value && setDirection(value)}>
              <SelectTrigger id="adjustment-direction" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add stock</SelectItem>
                <SelectItem value="remove">Remove stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjustment-quantity">Quantity</Label>
            <Input
              id="adjustment-quantity"
              type="number"
              min="1"
              max={direction === "remove" ? product?.stock : undefined}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjustment-reason">Reason</Label>
            <Input
              id="adjustment-reason"
              value={reason}
              minLength={3}
              maxLength={500}
              placeholder="e.g. Supplier delivery"
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
            disabled={loading || !product || quantity < 1 || reason.trim().length < 3}
          >
            {loading ? "Saving…" : "Save adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
