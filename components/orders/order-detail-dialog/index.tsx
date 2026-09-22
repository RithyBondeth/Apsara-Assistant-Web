"use client";

import { useState } from "react";
import { X, Trash2, CreditCard, Copy, Check, ReceiptText, ScanLine, Loader2, AlertTriangle, Ban, CircleCheck, CircleHelp } from "lucide-react";
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
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  SHARED_SELECT_CLASS,
} from "@/utils/constants/order.constant";
import { IReceipt, TOrderStatus, TReceiptVerdict } from "@/utils/interfaces/order/order.interface";
import { formatDate } from "@/utils/functions/date";
import { formatMoney } from "@/utils/functions/money";
import { cn } from "@/lib/utils";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";
import { useLanguage } from "@/components/utils/languages/language-context";
import { IOrderDetailDialogProps } from "./props";
import { BASE_URL } from "@/utils/constants/apis/base.api.constant";

export default function OrderDetailDialog({
  order,
  customer,
  products,
  open,
  onOpenChange,
  onStatusChange,
  onDelete,
  onCreateCheckout,
  receipts,
  receiptsLoading,
  onConfirmReceipt,
  onRejectReceipt,
  onScanReceipt,
  scanningReceiptId,
  error,
  onDismissError,
}: IOrderDetailDialogProps) {
  // ── All States
  const [saving, setSaving] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const t = useAppT("orders");
  const d = t.detail;
  const c = useAppT("common");
  const language = useLanguage();

  if (!order) return null;

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? fmt(d.productFallback, { id: id.slice(0, 8) });
  const statusHint = order.status === "cancelled" ? t.statusHints.cancelled : null;

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
    if (!confirm(d.confirmDelete)) return;
    setSaving(true);
    const ok = await onDelete();
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  async function handleReceipt(receiptId: string, action: "confirm" | "reject") {
    setSaving(true);
    await (action === "confirm" ? onConfirmReceipt(receiptId) : onRejectReceipt(receiptId));
    setSaving(false);
  }

  // ── Render UI
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {d.title}
            <Badge className={cn(ORDER_STATUS_STYLES[order.status])}>
              {t.status[order.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {fmt(d.placedBy, { customer: customer?.name ?? d.customerFallback, date: formatDate(order.created_at, language) })}
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
                    {item.variant_name}{item.variant_sku ? ` · ${item.variant_sku}` : ""}
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
              <span className="text-sm">{d.total}</span>
              <span>{formatMoney(order.total_amount, order.currency)}</span>
            </div>
          </div>

          {/* ── Delivery details */}
          {(order.delivery_address || order.notes) && (
            <div className="space-y-1.5 text-sm">
              {order.delivery_address && (
                <p>
                  <span className="text-muted-foreground">{d.deliverTo}</span>
                  {order.delivery_address}
                </p>
              )}
              {order.notes && (
                <p>
                  <span className="text-muted-foreground">{d.notes}</span>
                  {order.notes}
                </p>
              )}
            </div>
          )}

          {/* ── Status */}
          <div className="space-y-1.5">
            <Label htmlFor="order-status">{d.status}</Label>
            <select
              id="order-status"
              value={order.status}
              disabled={saving}
              onChange={(e) => handleStatus(e.target.value as TOrderStatus)}
              className={SHARED_SELECT_CLASS}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t.status[status]}
                </option>
              ))}
            </select>
            {statusHint && (
              <p className="text-xs text-muted-foreground">{statusHint}</p>
            )}
          </div>

          {/* ── Payment */}
          <div className="space-y-1.5">
            <Label>{d.payment}</Label>
            <div className="flex items-center gap-2">
              <Badge className={cn(PAYMENT_STATUS_STYLES[order.payment_status])}>
                {t.payment[order.payment_status]}
              </Badge>
              {order.payment_status !== "paid" && order.status !== "cancelled" && (
                <Button size="sm" variant="outline" disabled={saving}
                        onClick={handleCheckout}>
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  {checkoutUrl ? d.newLink : d.paymentLink}
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
                  aria-label={d.stripeLinkAria}
                  className="w-full truncate rounded bg-transparent px-1 py-0.5 text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleCopy}>
                    {copied ? (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {copied ? d.copied : d.copyLink}
                  </Button>
                  <p className="text-xs text-muted-foreground">{d.sendLinkHelp}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {order.payment_status === "paid"
                  ? order.payment_method === "qr"
                    ? d.receiptConfirmed
                    : d.stripeConfirmed
                  : d.createsStripe}
              </p>
            )}
          </div>

          {/* ── Customer payment evidence */}
          {order.conversation_id && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4" />
                <Label>{d.receipts}</Label>
              </div>
              {receiptsLoading ? (
                <p className="text-xs text-muted-foreground">{d.loadingReceipts}</p>
              ) : receipts.length === 0 ? (
                <p className="text-xs text-muted-foreground">{d.noReceipts}</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {receipts.map((receipt) => {
                    const imageUrl = receipt.file_url ??
                      `${BASE_URL}/api/v1/attachments/${encodeURIComponent(receipt.id)}/content`;
                    const isConfirmed = order.payment_receipt_attachment_id === receipt.id;
                    return (
                      <div key={receipt.id} className="space-y-2 rounded-lg border p-2">
                        {/* Private receipt bytes come from the authenticated API. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={receipt.file_name ?? d.receiptAlt}
                          className="h-36 w-full rounded bg-muted object-contain"
                        />
                        <ReceiptReading
                          receipt={receipt}
                          orderTotal={formatMoney(order.total_amount, order.currency)}
                          scanning={scanningReceiptId === receipt.id}
                          onScan={() => onScanReceipt(receipt.id)}
                        />
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">
                            {d.review[(isConfirmed ? "accepted" : receipt.review_status ?? "pending") as keyof typeof d.review]
                              ?? receipt.review_status}
                          </Badge>
                          {!isConfirmed && order.payment_status !== "paid" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={saving || receipt.review_status === "rejected"}
                                onClick={() => handleReceipt(receipt.id, "reject")}
                              >
                                {d.reject}
                              </Button>
                              {/* Confirming a receipt the reading disputes is
                                  still allowed — the reading can be wrong —
                                  but it should not be the inviting button. */}
                              <Button
                                size="sm"
                                variant={receipt.verdict && receipt.verdict !== "match" ? "outline" : "default"}
                                disabled={saving}
                                onClick={() => handleReceipt(receipt.id, "confirm")}
                              >
                                {d.confirm}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Failures come from the server: reviving a cancelled order is
                 refused when its stock has since been sold. */}
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

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {c.delete}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── What the model read, and how it compares ─────────────────────────────────

const VERDICT_STYLES: Record<TReceiptVerdict, { icon: typeof CircleCheck; className: string }> = {
  match: { icon: CircleCheck, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  amount_mismatch: { icon: AlertTriangle, className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  currency_differs: { icon: AlertTriangle, className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  duplicate: { icon: Ban, className: "bg-destructive/10 text-destructive" },
  not_a_receipt: { icon: CircleHelp, className: "bg-muted text-muted-foreground" },
  unreadable: { icon: CircleHelp, className: "bg-muted text-muted-foreground" },
};

function ReceiptReading({
  receipt,
  orderTotal,
  scanning,
  onScan,
}: {
  receipt: IReceipt;
  orderTotal: string;
  scanning: boolean;
  onScan: () => void;
}) {
  const d = useAppT("orders").detail;
  const verdict = receipt.verdict ?? null;
  const style = verdict ? VERDICT_STYLES[verdict] : null;
  const Icon = style?.icon;

  const verdictText = verdict
    ? verdict === "duplicate" && receipt.duplicate_of_order_id
      ? fmt(d.verdicts.duplicateUsedFor, { order: receipt.duplicate_of_order_id.slice(0, 8).toUpperCase() })
      : fmt(d.verdicts[verdict], { amount: orderTotal })
    : null;

  const details = [
    receipt.ocr_data?.bank,
    receipt.ocr_data?.payer,
    receipt.ocr_data?.paid_at,
  ].filter(Boolean).join(" · ");

  return (
    <div className="space-y-1.5 text-xs">
      {style && Icon && verdictText && (
        <div className={cn("flex items-start gap-1.5 rounded-md px-2 py-1.5", style.className)}>
          <Icon className="mt-0.5 size-3.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">
              {receipt.read ? `${fmt(d.reads, { read: receipt.read })} — ` : ""}{verdictText}
            </p>
            {(details || receipt.ocr_reference) && (
              <p className="mt-0.5 truncate opacity-80">
                {[details, receipt.ocr_reference ? fmt(d.reference, { reference: receipt.ocr_reference }) : null]
                  .filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}
      <Button size="xs" variant="ghost" disabled={scanning} onClick={onScan}>
        {scanning ? <Loader2 className="animate-spin" /> : <ScanLine />}
        {scanning ? d.scanning : verdict ? d.rescan : d.scan}
      </Button>
    </div>
  );
}
