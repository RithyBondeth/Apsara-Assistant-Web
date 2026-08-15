"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useOperationsStore } from "@/stores/apis/operations/operations.store";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { formatMoney } from "@/utils/functions/money";

export default function ReturnsPage(){
  const ops=useOperationsStore(); const {orders,fetchOrders}=useOrdersStore();
  const fetchReturns=ops.fetchReturns;
  const [orderId,setOrderId]=useState(""); const [itemId,setItemId]=useState(""); const [quantity,setQuantity]=useState(1); const [restock,setRestock]=useState(1); const [refund,setRefund]=useState("0"); const [reason,setReason]=useState("");
  useEffect(()=>{fetchReturns();fetchOrders();},[fetchReturns,fetchOrders]);
  const eligible=orders.filter(o=>["shipped","delivered"].includes(o.status)); const order=eligible.find(o=>o.id===orderId); const item=order?.items.find(i=>i.id===itemId);
  async function create(){if(!order||!item)return;const ok=await ops.createReturn({order_id:order.id,reason,refund_amount:refund,items:[{order_item_id:item.id,quantity,restock_quantity:restock}]});if(ok){setReason("");setOrderId("");setItemId("");}}
  return <><AppHeader title="Returns & refunds" description="Track returned goods, refunds, and inventory restoration"/><main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
    <Card><CardHeader><CardTitle className="text-base">Create return</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div><Label>Fulfilled order</Label><select className={SHARED_SELECT_CLASS} value={orderId} onChange={e=>{setOrderId(e.target.value);setItemId("")}}><option value="">Choose order</option>{eligible.map(o=><option key={o.id} value={o.id}>#{o.id.slice(0,8)} · {formatMoney(Number(o.total_amount),o.currency)}</option>)}</select></div>
      <div><Label>Item</Label><select className={SHARED_SELECT_CLASS} value={itemId} onChange={e=>setItemId(e.target.value)}><option value="">Choose item</option>{order?.items.map(i=><option key={i.id} value={i.id}>{i.variant_name} · {i.quantity} sold</option>)}</select></div>
      <div><Label>Reason</Label><Input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why was it returned?"/></div>
      <div><Label>Returned quantity</Label><Input type="number" min={1} max={item?.quantity} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></div><div><Label>Restock quantity</Label><Input type="number" min={0} max={quantity} value={restock} onChange={e=>setRestock(Number(e.target.value))}/></div><div><Label>Refund amount</Label><Input type="number" min={0} step="0.01" value={refund} onChange={e=>setRefund(e.target.value)}/></div>
      <Button className="lg:col-span-3" onClick={create} disabled={!item||!reason.trim()||quantity<1||restock>quantity||ops.loading}>Create return</Button>
    </CardContent></Card>{ops.error&&<p role="alert" className="text-sm text-destructive">{ops.error}</p>}
    <Card><CardHeader><CardTitle className="text-base">Return history</CardTitle></CardHeader><CardContent className="space-y-3">{ops.returns.length===0?<p className="py-8 text-center text-sm text-muted-foreground">No returns yet.</p>:ops.returns.map(r=><div key={r.id} className="rounded-lg border p-4"><div className="flex items-center justify-between"><div><p className="font-medium">Order #{r.order_id.slice(0,8)}</p><p className="text-xs text-muted-foreground">{r.reason} · {r.items.map(i=>`${i.product_name} ${i.quantity}`).join(", ")}</p></div><Badge className="capitalize">{r.status}</Badge></div><div className="mt-3 flex items-center justify-between"><span className="text-sm">Refund: {r.refund_amount}</span><div className="flex gap-2">{!r.received_at&&<Button size="sm" variant="outline" onClick={()=>ops.receiveReturn(r.id)}>Receive & restock</Button>}{!r.refunded_at&&Number(r.refund_amount)>0&&<Button size="sm" onClick={()=>ops.refundReturn(r.id)}>Record refund</Button>}</div></div></div>)}</CardContent></Card>
  </main></>;
}
