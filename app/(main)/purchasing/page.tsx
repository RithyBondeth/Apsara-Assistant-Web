"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, ClipboardList, PackageCheck, Plus } from "lucide-react";
import AppHeader from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOperationsStore } from "@/stores/apis/operations/operations.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { formatMoney } from "@/utils/functions/money";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  ordered: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  partially_received: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function PurchasingPage() {
  const ops = useOperationsStore();
  const { products, fetchProducts } = useProductsStore();
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cost, setCost] = useState("0");
  const { fetchSuppliers, fetchPurchaseOrders } = ops;

  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
    fetchProducts();
  }, [fetchSuppliers, fetchPurchaseOrders, fetchProducts]);

  const variants = useMemo(
    () => products.flatMap((product) => product.variants.filter((variant) => variant.is_active).map((variant) => ({ product, variant }))),
    [products],
  );
  const openOrders = ops.purchaseOrders.filter((order) => order.status !== "received").length;
  const unitsDue = ops.purchaseOrders.reduce(
    (total, order) => total + order.items.reduce((sum, item) => sum + item.ordered_quantity - item.received_quantity, 0),
    0,
  );

  async function addSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await ops.createSupplier(supplierName.trim())) {
      setSupplierName("");
      setSupplierDialogOpen(false);
    }
  }

  async function createPurchaseOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supplierId || !variantId) return;
    const ok = await ops.createPurchaseOrder({ supplier_id: supplierId, items: [{ variant_id: variantId, ordered_quantity: quantity, unit_cost: cost }] });
    if (ok) {
      setVariantId("");
      setQuantity(1);
      setCost("0");
      setOrderDialogOpen(false);
    }
  }

  return (
    <>
      <AppHeader title="Purchasing" description="Suppliers, purchase orders, and stock receiving" />
      <main className="flex-1 space-y-6 p-4 text-left sm:p-6 lg:p-8">
        <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <h2 className="font-heading text-xl font-semibold tracking-tight">Keep incoming stock organized</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create orders for suppliers, then receive stock when deliveries arrive.</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setSupplierDialogOpen(true)}><Building2 /> Add supplier</Button>
            <Button className="flex-1 sm:flex-none" onClick={() => setOrderDialogOpen(true)}><Plus /> New order</Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Purchasing summary">
          <SummaryCard icon={Building2} label="Active suppliers" value={ops.suppliers.filter((supplier) => supplier.is_active).length} />
          <SummaryCard icon={ClipboardList} label="Open purchase orders" value={openOrders} />
          <SummaryCard icon={PackageCheck} label="Units awaiting delivery" value={unitsDue} />
        </section>

        {ops.error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{ops.error}</p>}

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Purchase orders</CardTitle>
            <CardDescription>A clear view of orders that need sending or receiving.</CardDescription>
            <CardAction><Badge variant="outline">{ops.purchaseOrders.length} total</Badge></CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {ops.purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-start gap-3 px-4 py-10">
                <div className="rounded-lg bg-muted p-2.5"><ClipboardList className="size-5 text-muted-foreground" /></div>
                <div><p className="font-medium">No purchase orders yet</p><p className="mt-1 text-sm text-muted-foreground">Create your first order to start tracking incoming stock.</p></div>
                <Button size="sm" onClick={() => setOrderDialogOpen(true)}><Plus /> New order</Button>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead className="pl-4">Supplier and items</TableHead><TableHead>Status</TableHead><TableHead>Received</TableHead><TableHead>Total</TableHead><TableHead className="pr-4 text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ops.purchaseOrders.map((order) => {
                    const ordered = order.items.reduce((sum, item) => sum + item.ordered_quantity, 0);
                    const received = order.items.reduce((sum, item) => sum + item.received_quantity, 0);
                    const remaining = order.items.filter((item) => item.received_quantity < item.ordered_quantity).map((item) => ({ item_id: item.id, quantity: item.ordered_quantity - item.received_quantity }));
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="min-w-64 pl-4 whitespace-normal"><p className="font-medium">{order.supplier.name}</p><p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{order.items.map((item) => `${item.product_name} — ${item.variant_name}`).join(", ")}</p></TableCell>
                        <TableCell><Badge className={STATUS_STYLES[order.status]}>{order.status.replaceAll("_", " ")}</Badge></TableCell>
                        <TableCell>{received} / {ordered}</TableCell>
                        <TableCell className="font-medium">{formatMoney(Number(order.total_cost), order.currency)}</TableCell>
                        <TableCell className="pr-4 text-right">
                          {order.status === "draft" && <Button size="sm" variant="outline" onClick={() => ops.orderPurchase(order.id)}>Mark ordered</Button>}
                          {["ordered", "partially_received"].includes(order.status) && <Button size="sm" onClick={() => ops.receivePurchase(order.id, remaining)}>Receive stock</Button>}
                          {order.status === "received" && <span className="text-xs text-muted-foreground">Complete</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="text-left">
          <DialogHeader><DialogTitle>Add supplier</DialogTitle><DialogDescription>Add a supplier now; contact details can be maintained as your purchasing workflow grows.</DialogDescription></DialogHeader>
          <form id="supplier-form" className="space-y-1.5" onSubmit={addSupplier}><Label htmlFor="supplier-name">Supplier name</Label><Input id="supplier-name" autoFocus value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="e.g. Phnom Penh Wholesale" /></form>
          <DialogFooter showCloseButton><Button form="supplier-form" type="submit" disabled={!supplierName.trim() || ops.loading}>{ops.loading ? "Adding…" : "Add supplier"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="text-left sm:max-w-lg">
          <DialogHeader><DialogTitle>New purchase order</DialogTitle><DialogDescription>Choose the stock you are ordering. You can receive it from the order list when it arrives.</DialogDescription></DialogHeader>
          <form id="purchase-order-form" className="grid gap-4 sm:grid-cols-2" onSubmit={createPurchaseOrder}>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="po-supplier">Supplier</Label><select id="po-supplier" className={SHARED_SELECT_CLASS} value={supplierId} onChange={(event) => setSupplierId(event.target.value)}><option value="">Choose supplier</option>{ops.suppliers.filter((supplier) => supplier.is_active).map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="po-variant">Product variant</Label><select id="po-variant" className={SHARED_SELECT_CLASS} value={variantId} onChange={(event) => setVariantId(event.target.value)}><option value="">Choose variant</option>{variants.map(({ product, variant }) => <option key={variant.id} value={variant.id}>{product.name} — {variant.name}</option>)}</select></div>
            <div className="space-y-1.5"><Label htmlFor="po-quantity">Quantity</Label><Input id="po-quantity" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></div>
            <div className="space-y-1.5"><Label htmlFor="po-cost">Unit cost</Label><Input id="po-cost" type="number" min={0} step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} /></div>
          </form>
          <DialogFooter showCloseButton><Button form="purchase-order-form" type="submit" disabled={!supplierId || !variantId || quantity < 1 || ops.loading}>{ops.loading ? "Creating…" : "Create draft"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return <Card size="sm" className="text-left"><CardContent className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></div><div><p className="text-xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></CardContent></Card>;
}
