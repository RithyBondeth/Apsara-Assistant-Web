"use client";

import { useState } from "react";
import { Bot, Mail, MapPin, Package, Phone, Plus, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/utils/functions/money";
import { timeAgo } from "@/utils/functions/date";
import { IConversationDetail } from "@/utils/interfaces/chat/chat.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { IOrder } from "@/utils/interfaces/order/order.interface";

interface InboxContextProps {
  conversation: IConversationDetail;
  customer?: ICustomer;
  orders: IOrder[];
  onHandlingModeChange: (mode: "auto" | "manual") => Promise<boolean>;
  onAddNote: (content: string) => Promise<boolean>;
  onDeleteNote: (noteId: string) => Promise<boolean>;
  onAddTag: (name: string) => Promise<boolean>;
  onDeleteTag: (tagId: string) => Promise<boolean>;
}

export default function InboxContext({
  conversation,
  customer,
  orders,
  onHandlingModeChange,
  onAddNote,
  onDeleteNote,
  onAddTag,
  onDeleteTag,
}: InboxContextProps) {
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    const content = note.trim();
    if (!content) return;
    setSaving(true);
    if (await onAddNote(content)) setNote("");
    setSaving(false);
  }

  async function saveTag() {
    const name = tag.trim();
    if (!name) return;
    setSaving(true);
    if (await onAddTag(name)) setTag("");
    setSaving(false);
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-muted/15">
      <section className="border-b p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ownership</p>
        <div className="mt-3 rounded-xl border bg-background p-3">
          <div className="flex items-start gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              {conversation.handling_mode === "auto" ? <Bot className="size-4" /> : <UserRound className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {conversation.handling_mode === "auto" ? "Apsara is replying" : "You are handling this"}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {conversation.handling_mode === "auto"
                  ? "New customer messages receive automatic answers."
                  : "Automatic replies are paused for this conversation."}
              </p>
            </div>
          </div>
          <Button
            variant={conversation.handling_mode === "auto" ? "default" : "outline"}
            size="sm"
            className="mt-3 w-full"
            onClick={() => onHandlingModeChange(conversation.handling_mode === "auto" ? "manual" : "auto")}
          >
            {conversation.handling_mode === "auto" ? "Take over conversation" : "Return to Apsara"}
          </Button>
        </div>
      </section>

      <section className="border-b p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
            {(customer?.name ?? "C").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{customer?.name ?? "Unknown customer"}</p>
            <p className="text-xs capitalize text-muted-foreground">{conversation.platform}</p>
          </div>
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          {customer?.phone && <p className="flex items-center gap-2"><Phone className="size-3.5" />{customer.phone}</p>}
          {customer?.email && <p className="flex items-center gap-2"><Mail className="size-3.5" />{customer.email}</p>}
          {!customer?.phone && !customer?.email && <p>No contact details saved yet.</p>}
        </div>
      </section>

      <section className="border-b p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</p>
          <span className="text-[11px] text-muted-foreground">{conversation.tags.length}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {conversation.tags.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
              {item.name}
              <button type="button" onClick={() => onDeleteTag(item.id)} aria-label={`Remove ${item.name} tag`} className="rounded-full p-0.5 hover:bg-foreground/10">
                ×
              </button>
            </Badge>
          ))}
          {conversation.tags.length === 0 && <p className="text-xs text-muted-foreground">No tags yet.</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); saveTag(); } }}
            placeholder="Add a tag"
            maxLength={40}
          />
          <Button size="icon" variant="outline" onClick={saveTag} disabled={!tag.trim() || saving} aria-label="Add tag">
            <Plus />
          </Button>
        </div>
      </section>

      <section className="border-b p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order history</p>
          <span className="text-[11px] text-muted-foreground">{orders.length}</span>
        </div>
        <div className="mt-3 space-y-2">
          {orders.slice(0, 4).map((order) => (
            <div key={order.id} className="rounded-xl border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold"><Package className="size-3.5 text-primary" />#{order.id.slice(0, 8)}</p>
                <Badge variant="outline" className="h-4 text-[10px] capitalize">{order.status}</Badge>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                <p className="text-xs font-semibold">{formatMoney(order.total_amount, order.currency)}</p>
              </div>
              {order.delivery_address && <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground"><MapPin className="mt-0.5 size-3 shrink-0" /><span className="line-clamp-2">{order.delivery_address}</span></p>}
            </div>
          ))}
          {orders.length === 0 && <p className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">No orders from this customer yet.</p>}
        </div>
      </section>

      <section className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internal notes</p>
          <span className="text-[11px] text-muted-foreground">Private</span>
        </div>
        <div className="mt-3 space-y-2">
          {conversation.notes.map((item) => (
            <div key={item.id} className="group rounded-xl bg-amber-50 p-3 text-amber-950 ring-1 ring-amber-200/80 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900">
              <p className="whitespace-pre-wrap text-xs leading-5">{item.content}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400">
                <span>You · {timeAgo(item.created_at)}</span>
                <button type="button" onClick={() => onDeleteNote(item.id)} aria-label="Delete note" className="rounded p-1 opacity-60 hover:bg-amber-200/60 hover:opacity-100 dark:hover:bg-amber-900">
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-3 min-h-20" placeholder="Add a private note for your team…" maxLength={2000} />
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={saveNote} disabled={!note.trim() || saving}>
          Add internal note
        </Button>
      </section>
    </div>
  );
}
