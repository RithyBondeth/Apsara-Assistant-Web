"use client";

import { useState } from "react";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { formatMoney } from "@/utils/functions/money";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { INewOrderDialogProps } from "./props";

interface ILine {
  product_id: string;
  quantity: number;
}

const EMPTY_LINE: ILine = { product_id: "", quantity: 1 };

export default function NewOrderDialog({
  open,
  onOpenChange,
  ...rest
}: INewOrderDialogProps) {
  // The form is mounted only while the dialog is open, so each open starts
  // from fresh state — a cancelled draft cannot leak into the next order, and
  // a conversation's customer is picked up on the way in. Resetting via an
  // effect instead would mean a second render pass every time.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <OrderForm onOpenChange={onOpenChange} {...rest} />}
      </DialogContent>
    </Dialog>
  );
}

type IOrderFormProps = Omit<INewOrderDialogProps, "open">;

function OrderForm({
  onOpenChange,
  customers,
  products,
  lockedCustomerId,
  conversationId,
  initialDraft,
  onCreate,
  error,
  onDismissError,
}: IOrderFormProps) {
  // A new order is priced in what the shop trades in today; the server records
  // the same value as the order's own currency.
  const currency = useAuthStore((s) => s.user?.currency);

  // ── All States
  const [customerId, setCustomerId] = useState(lockedCustomerId ?? "");
  const draftLines = initialDraft?.items
    .filter((item) => products.some((product) => product.id === item.product_id))
    .map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
  const [lines, setLines] = useState<ILine[]>(
    draftLines?.length ? draftLines : [{ ...EMPTY_LINE }],
  );
  const [address, setAddress] = useState(initialDraft?.delivery_address ?? "");
  const [notes, setNotes] = useState(initialDraft?.notes ?? "");
  const [saving, setSaving] = useState(false);

  // ── Derived
  // Only sellable products: the server rejects inactive or out-of-stock lines,
  // so offering them here would only produce a failed submit.
  const sellable = products.filter((p) => p.is_active && p.stock > 0);
  const chosen = lines.filter((l) => l.product_id);
  const total = chosen.reduce((sum, line) => {
    const product = products.find((p) => p.id === line.product_id);
    return sum + (product ? parseFloat(product.price) * line.quantity : 0);
  }, 0);
  const valid =
    Boolean(customerId) &&
    chosen.length > 0 &&
    chosen.every((l) => l.quantity > 0 && l.quantity <= stockFor(l.product_id));

  // ── Methods
  function updateLine(index: number, patch: Partial<ILine>) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function stockFor(productId: string) {
    return products.find((p) => p.id === productId)?.stock ?? 0;
  }

  async function handleCreate() {
    if (!valid) return;
    setSaving(true);
    const ok = await onCreate({
      customer_id: customerId,
      conversation_id: conversationId ?? null,
      delivery_address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      items: chosen.map((l) => ({
        product_id: l.product_id,
        quantity: l.quantity,
      })),
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  // ── Render UI
  return (
    <>
      <DialogHeader>
        <DialogTitle>New order</DialogTitle>
        <DialogDescription>
          Prices come from your catalogue, and placing the order takes the items
          out of stock.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
        {initialDraft && (
          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4" /> AI-generated draft
            </p>
            <p className="text-xs text-muted-foreground">
              Review every detail. Nothing is reserved until you place the order.
            </p>
            {[...initialDraft.missing_fields.map((field) => `Missing: ${field}`),
              ...initialDraft.warnings].map((warning, index) => (
              <p key={`${warning}-${index}`} className="text-xs text-amber-700">{warning}</p>
            ))}
          </div>
        )}
        {/* ── Customer */}
        <div className="space-y-1.5">
          <Label htmlFor="order-customer">Customer</Label>
          {lockedCustomerId ? (
            <p className="text-sm">
              {customers.find((c) => c.id === lockedCustomerId)?.name ??
                "This conversation's customer"}
            </p>
          ) : (
            <select
              id="order-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={SHARED_SELECT_CLASS}
            >
              <option value="">— Select a customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.platform ? ` (${c.platform})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Line items */}
        <div className="space-y-2">
          <Label>Items</Label>
          {sellable.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing in stock to sell. Add a product or restock one first.
            </p>
          ) : (
            lines.map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <select
                  aria-label={`Product for line ${index + 1}`}
                  value={line.product_id}
                  onChange={(e) =>
                    updateLine(index, {
                      product_id: e.target.value,
                      quantity: 1,
                    })
                  }
                  className={SHARED_SELECT_CLASS}
                >
                  <option value="">— Select a product —</option>
                  {sellable.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatMoney(p.price, currency)} ({p.stock}{" "}
                      left)
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={1}
                  max={stockFor(line.product_id) || undefined}
                  aria-label={`Quantity for line ${index + 1}`}
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(index, { quantity: Number(e.target.value) })
                  }
                  className="h-8 w-20 shrink-0"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove line ${index + 1}`}
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((current) => current.filter((_, i) => i !== index))
                  }
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}

          {sellable.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLines((current) => [...current, { ...EMPTY_LINE }])
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add item
            </Button>
          )}
        </div>

        {/* ── Delivery */}
        <div className="space-y-1.5">
          <Label htmlFor="order-address">Delivery address</Label>
          <Textarea
            id="order-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, commune, city"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="order-notes">Notes</Label>
          <Textarea
            id="order-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the customer asked for"
          />
        </div>

        {/* ── Running total, priced from the catalogue like the server will */}
        {chosen.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm font-medium">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Dismiss"
              className="shrink-0 rounded p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!valid || saving}>
          {saving ? "Placing…" : "Place order"}
        </Button>
      </DialogFooter>
    </>
  );
}
