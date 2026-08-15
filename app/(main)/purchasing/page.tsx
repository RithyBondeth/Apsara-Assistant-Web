"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useOperationsStore } from "@/stores/apis/operations/operations.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { formatMoney } from "@/utils/functions/money";

export default function PurchasingPage() {
  const ops = useOperationsStore();
  const fetchSuppliers = ops.fetchSuppliers;
  const fetchPurchaseOrders = ops.fetchPurchaseOrders;
  const { products, fetchProducts } = useProductsStore();
  const [supplierName,setSupplierName]=useState(""); const [supplierId,setSupplierId]=useState("");
  const [variantId,setVariantId]=useState(""); const [quantity,setQuantity]=useState(1); const [cost,setCost]=useState("0");
  useEffect(()=>{ fetchSuppliers(); fetchPurchaseOrders(); fetchProducts(); },[fetchSuppliers,fetchPurchaseOrders,fetchProducts]);
  const variants=useMemo(()=>products.flatMap(p=>p.variants.filter(v=>v.is_active).map(v=>({p,v}))),[products]);
  async function addSupplier(){ if(await ops.createSupplier(supplierName.trim())) setSupplierName(""); }
  async function createPo(){ if(!supplierId||!variantId)return; await ops.createPurchaseOrder({supplier_id:supplierId,items:[{variant_id:variantId,ordered_quantity:quantity,unit_cost:cost}]}); }
  return <><AppHeader title="Purchasing" description="Suppliers, purchase orders, and stock receiving"/><main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Add supplier</CardTitle></CardHeader><CardContent className="flex gap-2"><Input aria-label="Supplier name" placeholder="Supplier name" value={supplierName} onChange={e=>setSupplierName(e.target.value)}/><Button onClick={addSupplier} disabled={!supplierName.trim()||ops.loading}>Add</Button></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">New purchase order</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
        <div><Label>Supplier</Label><select className={SHARED_SELECT_CLASS} value={supplierId} onChange={e=>setSupplierId(e.target.value)}><option value="">Choose supplier</option>{ops.suppliers.filter(s=>s.is_active).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><Label>Product variant</Label><select className={SHARED_SELECT_CLASS} value={variantId} onChange={e=>setVariantId(e.target.value)}><option value="">Choose variant</option>{variants.map(({p,v})=><option key={v.id} value={v.id}>{p.name} — {v.name}</option>)}</select></div>
        <div><Label>Quantity</Label><Input type="number" min={1} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></div><div><Label>Unit cost</Label><Input type="number" min={0} step="0.01" value={cost} onChange={e=>setCost(e.target.value)}/></div>
        <Button className="sm:col-span-2" onClick={createPo} disabled={!supplierId||!variantId||quantity<1||ops.loading}>Create draft</Button>
      </CardContent></Card>
    </div>
    {ops.error&&<p role="alert" className="text-sm text-destructive">{ops.error}</p>}
    <Card><CardHeader><CardTitle className="text-base">Purchase orders</CardTitle></CardHeader><CardContent className="space-y-3">{ops.purchaseOrders.length===0?<p className="py-8 text-center text-sm text-muted-foreground">No purchase orders yet.</p>:ops.purchaseOrders.map(po=>{const remaining=po.items.filter(i=>i.received_quantity<i.ordered_quantity).map(i=>({item_id:i.id,quantity:i.ordered_quantity-i.received_quantity}));return <div key={po.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium">{po.supplier.name}</p><p className="text-xs text-muted-foreground">{po.items.map(i=>`${i.product_name} — ${i.variant_name} · ${i.received_quantity}/${i.ordered_quantity}`).join(", ")}</p></div><Badge className="capitalize">{po.status.replaceAll("_"," ")}</Badge></div><div className="mt-3 flex items-center justify-between"><span className="text-sm">{formatMoney(Number(po.total_cost),po.currency)}</span><div className="flex gap-2">{po.status==="draft"&&<Button size="sm" onClick={()=>ops.orderPurchase(po.id)}>Mark ordered</Button>}{["ordered","partially_received"].includes(po.status)&&<Button size="sm" onClick={()=>ops.receivePurchase(po.id,remaining)}>Receive remaining</Button>}</div></div></div>})}</CardContent></Card>
  </main></>;
}
