"use client";

import { useState } from "react";
import { X, Trash2, CreditCard, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ORDER_STATUSES,
  ORDER_STATUS_HINTS,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  SHARED_SELECT_CLASS,
} from "@/utils/constants/order.constant";
import { TOrderStatus } from "@/utils/interfaces/order/order.interface";
import { formatDate } from "@/utils/functions/date";
import { formatMoney } from "@/utils/functions/money";
import { cn } from "@/lib/utils";
import { IOrderDetailDialogProps } from "./props";

export default function OrderDetailDialog({
  order,
  customer,
  products,
  open,
  onOpenChange,
  onStatusChange,
  onDelete,
  onCreateCheckout,
  error,
  onDismissError,
}: IOrderDetailDialogProps) {
  // ── All States
  const [saving, setSaving] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? `Product ${id.slice(0, 8)}`;

  // ── Methods
  async function handleStatus(status: TOrderStatus) {
    if (!order || status === order.status) return;
    setSaving(true);
    await onStatusChange(status);
    setSaving(false);
  }

  async function handleCheckout() {
    setSaving(true);
    const checkout = await onCreateCheckout();
    setSaving(false);
    // Null means the server refused — the reason is already in `error`.
    if (checkout) {
      setCheckoutUrl(checkout.checkout_url);
      setCopied(false);
    }
  }

  async function handleCopy() {
    if (!checkoutUrl) return;
    await navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
  }

  async function handleDelete() {
    if (!confirm("Delete this order? Its items return to your stock.")) return;
    setSaving(true);
    const ok = await onDelete();
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  // ── Render UI
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order
            <Badge className={cn("capitalize", ORDER_STATUS_STYLES[order.status])}>
              {order.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {customer?.name ?? "Customer"} · placed {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── Line items */}
          <div className="rounded-lg border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {productName(item.product_id)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatMoney(item.unit_price, order.currency)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatMoney(item.subtotal, order.currency)}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 font-medium">
              <span className="text-sm">Total</span>
              <span>{formatMoney(order.total_amount, order.currency)}</span>
            </div>
          </div>

          {/* ── Delivery details */}
          {(order.delivery_address || order.notes) && (
            <div className="space-y-1.5 text-sm">
              {order.delivery_address && (
                <p>
                  <span className="text-muted-foreground">Deliver to: </span>
                  {order.delivery_address}
                </p>
              )}
              {order.notes && (
                <p>
                  <span className="text-muted-foreground">Notes: </span>
                  {order.notes}
                </p>
              )}
            </div>
          )}

          {/* ── Status */}
          <div className="space-y-1.5">
            <Label htmlFor="order-status">Status</Label>
            <select
              id="order-status"
              value={order.status}
              disabled={saving}
              onChange={(e) => handleStatus(e.target.value as TOrderStatus)}
              className={SHARED_SELECT_CLASS}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            {ORDER_STATUS_HINTS[order.status] && (
              <p className="text-xs text-muted-foreground">
                {ORDER_STATUS_HINTS[order.status]}
              </p>
            )}
          </div>

          {/* ── Card payment */}
          <div className="space-y-1.5">
            <Label>Payment</Label>
            <div className="flex items-center gap-2">
              <Badge className={cn("capitalize", PAYMENT_STATUS_STYLES[order.payment_status])}>
                {order.payment_status}
              </Badge>
              {order.payment_status !== "paid" && order.status !== "cancelled" && (
                <Button size="sm" variant="outline" disabled={saving}
                        onClick={handleCheckout}>
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  {checkoutUrl ? "New link" : "Payment link"}
                </Button>
              )}
            </div>

            {checkoutUrl ? (
              <div className="space-y-1.5 rounded-lg border bg-muted/40 p-2">
                {/* Read-only and selectable: this gets pasted into a Messenger
                    or Telegram chat, so copying it has to be effortless. */}
                <input
                  readOnly
                  value={checkoutUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Stripe payment link"
                  className="w-full truncate rounded bg-transparent px-1 py-0.5 text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleCopy}>
                    {copied ? (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Send this to the customer. The order is marked paid
                    automatically.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {order.payment_status === "paid"
                  ? "Confirmed by Stripe."
                  : "Creates a Stripe page you can send to the customer."}
              </p>
            )}
          </div>

          {/* ── Failures come from the server: reviving a cancelled order is
                 refused when its stock has since been sold. */}
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

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
