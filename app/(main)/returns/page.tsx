"use client";

import { FormEvent, useEffect, useState } from "react";
import { CircleDollarSign, PackageCheck, Plus, RotateCcw } from "lucide-react";
import AppHeader from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOperationsStore } from "@/stores/apis/operations/operations.store";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { formatMoney } from "@/utils/functions/money";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

export default function ReturnsPage() {
  const ops = useOperationsStore();
  const { orders, fetchOrders } = useOrdersStore();
  const t = useAppT("returns");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [restock, setRestock] = useState(1);
  const [refund, setRefund] = useState("0");
  const [reason, setReason] = useState("");
  const { fetchReturns } = ops;

  useEffect(() => { fetchReturns(); fetchOrders(); }, [fetchReturns, fetchOrders]);

  const eligibleOrders = orders.filter((order) => ["shipped", "delivered"].includes(order.status));
  const selectedOrder = eligibleOrders.find((order) => order.id === orderId);
  const selectedItem = selectedOrder?.items.find((item) => item.id === itemId);
  const awaitingStock = ops.returns.filter((salesReturn) => !salesReturn.received_at).length;
  const awaitingRefund = ops.returns.filter((salesReturn) => !salesReturn.refunded_at && Number(salesReturn.refund_amount) > 0).length;

  async function createReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrder || !selectedItem) return;
    const ok = await ops.createReturn({ order_id: selectedOrder.id, reason, refund_amount: refund, items: [{ order_item_id: selectedItem.id, quantity, restock_quantity: restock }] });
    if (ok) {
      setReason(""); setOrderId(""); setItemId(""); setQuantity(1); setRestock(1); setRefund("0"); setDialogOpen(false);
    }
  }

  return (
    <>
      <AppHeader title={t.title} description={t.description} />
      <main className="flex-1 space-y-6 p-4 text-left sm:p-6 lg:p-8">
        <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="max-w-2xl"><h2 className="font-heading text-xl font-semibold tracking-tight">{t.heading}</h2><p className="mt-1 text-sm text-muted-foreground">{t.subheading}</p></div>
          <Button className="w-full sm:w-auto" onClick={() => setDialogOpen(true)}><Plus /> {t.create}</Button>
        </section>

        <section className="grid gap-3 sm:grid-cols-3" aria-label={t.summaryAria}>
          <SummaryCard icon={RotateCcw} label={t.totalReturns} value={ops.returns.length} />
          <SummaryCard icon={PackageCheck} label={t.awaitingReceipt} value={awaitingStock} />
          <SummaryCard icon={CircleDollarSign} label={t.refundsToRecord} value={awaitingRefund} />
        </section>

        {ops.error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{ops.error}</p>}

        <Card>
          <CardHeader className="border-b"><CardTitle>{t.historyTitle}</CardTitle><CardDescription>{t.historyDescription}</CardDescription><CardAction><Badge variant="outline">{fmt(t.total, { count: ops.returns.length })}</Badge></CardAction></CardHeader>
          <CardContent className="px-0">
            {ops.returns.length === 0 ? (
              <div className="flex flex-col items-start gap-3 px-4 py-10"><div className="rounded-lg bg-muted p-2.5"><RotateCcw className="size-5 text-muted-foreground" /></div><div><p className="font-medium">{t.noneTitle}</p><p className="mt-1 text-sm text-muted-foreground">{t.noneBody}</p></div><Button size="sm" onClick={() => setDialogOpen(true)}><Plus /> {t.create}</Button></div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead className="pl-4">{t.orderAndReason}</TableHead><TableHead>{t.item}</TableHead><TableHead>{t.inventory}</TableHead><TableHead>{t.refund}</TableHead><TableHead className="pr-4 text-right">{t.actions}</TableHead></TableRow></TableHeader>
                <TableBody>{ops.returns.map((salesReturn) => <TableRow key={salesReturn.id}>
                  <TableCell className="min-w-56 pl-4 whitespace-normal"><p className="font-medium">{fmt(t.orderNo, { id: salesReturn.order_id.slice(0, 8) })}</p><p className="mt-0.5 text-xs text-muted-foreground">{salesReturn.reason}</p></TableCell>
                  <TableCell className="min-w-48 whitespace-normal">{salesReturn.items.map((item) => `${item.product_name} — ${item.variant_name} × ${item.quantity}`).join(", ")}</TableCell>
                  <TableCell>{salesReturn.received_at ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{t.restocked}</Badge> : <Badge variant="outline">{t.awaitingReceipt}</Badge>}</TableCell>
                  <TableCell>{Number(salesReturn.refund_amount) === 0 ? <span className="text-muted-foreground">{t.noRefund}</span> : salesReturn.refunded_at ? <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{t.recorded}</Badge> : salesReturn.refund_amount}</TableCell>
                  <TableCell className="pr-4"><div className="flex justify-end gap-2">{!salesReturn.received_at && <Button size="sm" variant="outline" onClick={() => ops.receiveReturn(salesReturn.id)}>{t.receive}</Button>}{!salesReturn.refunded_at && Number(salesReturn.refund_amount) > 0 && <Button size="sm" onClick={() => ops.refundReturn(salesReturn.id)}>{t.refund}</Button>}{salesReturn.received_at && (salesReturn.refunded_at || Number(salesReturn.refund_amount) === 0) && <span className="text-xs text-muted-foreground">{t.complete}</span>}</div></TableCell>
                </TableRow>)}</TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="text-left sm:max-w-lg">
          <DialogHeader><DialogTitle>{t.dialogTitle}</DialogTitle><DialogDescription>{t.dialogDescription}</DialogDescription></DialogHeader>
          <form id="return-form" className="grid gap-4 sm:grid-cols-2" onSubmit={createReturn}>
            <div className="space-y-1.5"><Label htmlFor="return-order">{t.fulfilledOrder}</Label><select id="return-order" className={SHARED_SELECT_CLASS} value={orderId} onChange={(event) => { setOrderId(event.target.value); setItemId(""); }}><option value="">{t.chooseOrder}</option>{eligibleOrders.map((order) => <option key={order.id} value={order.id}>#{order.id.slice(0, 8)} · {formatMoney(Number(order.total_amount), order.currency)}</option>)}</select></div>
            <div className="space-y-1.5"><Label htmlFor="return-item">{t.item}</Label><select id="return-item" className={SHARED_SELECT_CLASS} value={itemId} onChange={(event) => setItemId(event.target.value)}><option value="">{t.chooseItem}</option>{selectedOrder?.items.map((item) => <option key={item.id} value={item.id}>{item.variant_name} · {fmt(t.sold, { count: item.quantity })}</option>)}</select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="return-reason">{t.reason}</Label><Input id="return-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t.reasonPlaceholder} /></div>
            <div className="space-y-1.5"><Label htmlFor="return-quantity">{t.returnedQuantity}</Label><Input id="return-quantity" type="number" min={1} max={selectedItem?.quantity} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></div>
            <div className="space-y-1.5"><Label htmlFor="restock-quantity">{t.restockQuantity}</Label><Input id="restock-quantity" type="number" min={0} max={quantity} value={restock} onChange={(event) => setRestock(Number(event.target.value))} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="refund-amount">{t.refundAmount}</Label><Input id="refund-amount" type="number" min={0} step="0.01" value={refund} onChange={(event) => setRefund(event.target.value)} /></div>
          </form>
          <DialogFooter showCloseButton><Button form="return-form" type="submit" disabled={!selectedItem || !reason.trim() || quantity < 1 || restock > quantity || ops.loading}>{ops.loading ? t.creating : t.create}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof RotateCcw; label: string; value: number }) {
  return <Card size="sm" className="text-left"><CardContent className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></div><div><p className="text-xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></CardContent></Card>;
}
