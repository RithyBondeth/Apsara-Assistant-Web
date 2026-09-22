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
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";
import { INewOrderDialogProps } from "./props";

interface ILine {
  product_id: string;
  variant_id: string;
  quantity: number;
}

const EMPTY_LINE: ILine = { product_id: "", variant_id: "", quantity: 1 };

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
  const t = useAppT("orders").form;
  const c = useAppT("common");

  // ── All States
  const [customerId, setCustomerId] = useState(lockedCustomerId ?? "");
  const draftLines = initialDraft?.items
    .filter((item) => products.some((product) =>
      product.id === item.product_id && product.variants.some((variant) => variant.id === item.variant_id),
    ))
    .map((item) => ({ product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity }));
  const [lines, setLines] = useState<ILine[]>(
    draftLines?.length ? draftLines : [{ ...EMPTY_LINE }],
  );
  const [address, setAddress] = useState(initialDraft?.delivery_address ?? "");
  const [notes, setNotes] = useState(initialDraft?.notes ?? "");
  const [saving, setSaving] = useState(false);

  // ── Derived
  // Only sellable products: the server rejects inactive or out-of-stock lines,
  // so offering them here would only produce a failed submit.
  const sellable = products.flatMap((product) =>
    product.is_active
      ? product.variants
          .filter((variant) => variant.is_active && variant.stock > 0)
          .map((variant) => ({ product, variant }))
      : [],
  );
  const chosen = lines.filter((line) => line.product_id && line.variant_id);
  const total = chosen.reduce((sum, line) => {
    const variant = products
      .find((product) => product.id === line.product_id)
      ?.variants.find((item) => item.id === line.variant_id);
    return sum + (variant ? parseFloat(variant.price) * line.quantity : 0);
  }, 0);
  const valid =
    Boolean(customerId) &&
    chosen.length > 0 &&
    chosen.every((line) => line.quantity > 0 && line.quantity <= stockFor(line.variant_id));

  // ── Methods
  function updateLine(index: number, patch: Partial<ILine>) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function stockFor(variantId: string) {
    return products.flatMap((product) => product.variants).find((variant) => variant.id === variantId)?.stock ?? 0;
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
        variant_id: l.variant_id,
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
        <DialogTitle>{t.title}</DialogTitle>
        <DialogDescription>{t.description}</DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
        {initialDraft && (
          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4" /> {t.aiDraft}
            </p>
            <p className="text-xs text-muted-foreground">{t.aiDraftHelp}</p>
            {[...initialDraft.missing_fields.map((field) => fmt(t.missing, { field })),
              ...initialDraft.warnings].map((warning, index) => (
              <p key={`${warning}-${index}`} className="text-xs text-amber-700">{warning}</p>
            ))}
          </div>
        )}
        {/* ── Customer */}
        <div className="space-y-1.5">
          <Label htmlFor="order-customer">{t.customer}</Label>
          {lockedCustomerId ? (
            <p className="text-sm">
              {customers.find((item) => item.id === lockedCustomerId)?.name ?? t.conversationCustomer}
            </p>
          ) : (
            <select
              id="order-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={SHARED_SELECT_CLASS}
            >
              <option value="">{t.selectCustomer}</option>
              {customers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.platform ? ` (${item.platform})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Line items */}
        <div className="space-y-2">
          <Label>{t.items}</Label>
          {sellable.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.nothingInStock}</p>
          ) : (
            lines.map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <select
                  aria-label={fmt(t.productForLine, { n: index + 1 })}
                  value={line.variant_id}
                  onChange={(e) => {
                    const selected = sellable.find((item) => item.variant.id === e.target.value);
                    updateLine(index, {
                      product_id: selected?.product.id ?? "",
                      variant_id: selected?.variant.id ?? "",
                      quantity: 1,
                    });
                  }}
                  className={SHARED_SELECT_CLASS}
                >
                  <option value="">{t.selectProduct}</option>
                  {sellable.map(({ product, variant }) => (
                    <option key={variant.id} value={variant.id}>
                      {product.name} — {variant.name} — {formatMoney(variant.price, currency)} ({fmt(t.left, { count: variant.stock })})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={1}
                  max={stockFor(line.variant_id) || undefined}
                  aria-label={fmt(t.quantityForLine, { n: index + 1 })}
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(index, { quantity: Number(e.target.value) })
                  }
                  className="h-8 w-20 shrink-0"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={fmt(t.removeLine, { n: index + 1 })}
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
              {t.addItem}
            </Button>
          )}
        </div>

        {/* ── Delivery */}
        <div className="space-y-1.5">
          <Label htmlFor="order-address">{t.address}</Label>
          <Textarea
            id="order-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.addressPlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="order-notes">{t.notes}</Label>
          <Textarea
            id="order-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
          />
        </div>

        {/* ── Running total, priced from the catalogue like the server will */}
        {chosen.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm font-medium">
            <span>{t.total}</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={onDismissError}
              aria-label={c.dismiss}
              className="shrink-0 rounded p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {c.cancel}
        </Button>
        <Button onClick={handleCreate} disabled={!valid || saving}>
          {saving ? t.placing : t.place}
        </Button>
      </DialogFooter>
    </>
  );
}
