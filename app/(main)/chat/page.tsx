"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Clock3, Inbox, MessageCircle, Plus, Search, UserRound, X } from "lucide-react";
import AppHeader from "@/components/header";
import ConversationList from "@/components/chat/conversation-list";
import ChatWindow from "@/components/chat/chat-window";
import InboxContext from "@/components/chat/inbox-context";
import NewConversationDialog from "@/components/chat/new-conversation-dialog";
import NewOrderDialog from "@/components/orders/new-order-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { useOrdersStore } from "@/stores/apis/orders/orders.store";
import { IConversation, IInboxFilters } from "@/utils/interfaces/chat/chat.interface";
import { IOrderCreate, IOrderDraft } from "@/utils/interfaces/order/order.interface";
import { cn } from "@/lib/utils";

const SELECT_CLASS = "h-8 min-w-0 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function responseTime(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export default function ChatPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDraft, setOrderDraft] = useState<IOrderDraft | null>(null);
  const [filters, setFilters] = useState<IInboxFilters>({});
  const [search, setSearch] = useState("");

  const chat = useChatStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { products, fetchProducts } = useProductsStore();
  const ordersStore = useOrdersStore();
  const {
    activeConversation,
    fetchConversations,
    fetchConversationDetail,
    fetchInboxMetrics,
  } = chat;
  const { fetchOrders } = ordersStore;

  useEffect(() => {
    fetchInboxMetrics();
    fetchCustomers();
    fetchProducts();
    fetchOrders();
  }, [fetchInboxMetrics, fetchCustomers, fetchProducts, fetchOrders]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = { ...filters, search: search.trim() || undefined };
      fetchConversations(false, next);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [filters, search, fetchConversations]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const currentFilters = { ...filters, search: search.trim() || undefined };
      fetchConversations(true, currentFilters);
      fetchInboxMetrics();
      if (activeConversation) fetchConversationDetail(activeConversation.id, true);
    }, 5000);
    return () => window.clearInterval(id);
  }, [activeConversation, fetchConversationDetail, fetchConversations, fetchInboxMetrics, filters, search]);

  const activeCustomer = customers.find((customer) => customer.id === chat.activeConversation?.customer_id);
  const customerOrders = useMemo(
    () => ordersStore.orders.filter((order) => order.customer_id === chat.activeConversation?.customer_id),
    [ordersStore.orders, chat.activeConversation?.customer_id],
  );

  function selectConversation(conversation: IConversation) {
    chat.setActiveConversation(conversation);
    chat.fetchConversationDetail(conversation.id);
  }

  async function createConversation(customerId: string, platform: string) {
    const conversation = await chat.createConversation(customerId, platform);
    if (conversation) selectConversation(conversation);
  }

  async function send(content: string) {
    if (!chat.activeConversation) return;
    if (chat.activeConversation.source === "channel") {
      await chat.sendSellerMessage(chat.activeConversation.id, content);
    } else {
      await chat.sendMessage(chat.activeConversation.id, content);
    }
    chat.fetchConversations(true, filters);
  }

  async function changeStatus(status: "open" | "closed" | "pending") {
    if (!chat.activeConversation) return;
    if (await chat.updateConversationStatus(chat.activeConversation.id, status)) chat.fetchInboxMetrics();
  }

  async function changeHandlingMode(mode: "auto" | "manual") {
    if (!chat.activeConversation) return false;
    const changed = await chat.setHandlingMode(chat.activeConversation.id, mode);
    if (changed) chat.fetchInboxMetrics();
    return changed;
  }

  async function createOrder(data: IOrderCreate) {
    const order = await ordersStore.createOrder(data);
    if (order) {
      fetchProducts();
      ordersStore.fetchOrders();
    }
    return Boolean(order);
  }

  async function draftOrder() {
    if (!chat.activeConversation) return;
    ordersStore.clearError();
    const draft = await ordersStore.draftOrder(chat.activeConversation.id);
    if (draft) {
      await fetchProducts();
      setOrderDraft(draft);
      setOrderOpen(true);
    }
  }

  const context = chat.activeConversation ? (
    <InboxContext
      key={chat.activeConversation.id}
      conversation={chat.activeConversation}
      customer={activeCustomer}
      orders={customerOrders}
      onHandlingModeChange={changeHandlingMode}
      onAddNote={(content) => chat.addNote(chat.activeConversation!.id, content)}
      onDeleteNote={(noteId) => chat.deleteNote(chat.activeConversation!.id, noteId)}
      onAddTag={(name) => chat.addTag(chat.activeConversation!.id, name)}
      onDeleteTag={(tagId) => chat.deleteTag(chat.activeConversation!.id, tagId)}
    />
  ) : null;

  const preset = filters.unread_only ? "unread" : filters.assignment === "me" ? "mine" : "all";

  return (
    <>
      <AppHeader title="Inbox" description="Messenger and Telegram conversations in one workspace" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="hidden grid-cols-4 border-b bg-muted/20 lg:grid">
          <Metric icon={Inbox} label="Open conversations" value={chat.metrics?.open ?? 0} />
          <Metric icon={MessageCircle} label="Unread messages" value={chat.metrics?.unread ?? 0} />
          <Metric icon={UserRound} label="Manual takeover" value={chat.metrics?.manual ?? 0} />
          <Metric icon={Clock3} label="Avg. first response" value={responseTime(chat.metrics?.average_first_response_seconds)} />
        </div>

        <main className="flex min-h-0 flex-1 overflow-hidden">
          <aside className={cn("flex w-full shrink-0 flex-col border-r bg-background md:w-80", chat.activeConversation && "hidden md:flex")}>
            <div className="space-y-3 border-b p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Conversations</p>
                  <p className="text-[11px] text-muted-foreground">{chat.conversations.length} in this view</p>
                </div>
                <Button size="icon-sm" variant="outline" onClick={() => setDialogOpen(true)} aria-label="New rehearsal conversation">
                  <Plus />
                </Button>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-8" placeholder="Search customers…" />
              </div>
              <div className="grid grid-cols-3 rounded-lg bg-muted p-0.5">
                {(["all", "unread", "mine"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, unread_only: item === "unread" || undefined, assignment: item === "mine" ? "me" : undefined }))}
                    className={cn("rounded-md px-2 py-1.5 text-xs font-medium capitalize text-muted-foreground transition", preset === item && "bg-background text-foreground shadow-sm")}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={filters.platform ?? ""} onChange={(event) => setFilters((current) => ({ ...current, platform: (event.target.value || undefined) as IInboxFilters["platform"] }))} className={SELECT_CLASS} aria-label="Filter by channel">
                  <option value="">All channels</option>
                  <option value="messenger">Messenger</option>
                  <option value="telegram">Telegram</option>
                </select>
                <select value={filters.status ?? ""} onChange={(event) => setFilters((current) => ({ ...current, status: (event.target.value || undefined) as IInboxFilters["status"] }))} className={SELECT_CLASS} aria-label="Filter by status">
                  <option value="">Any status</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {chat.conversationsLoading ? (
              <div className="space-y-2 p-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)}</div>
            ) : (
              <ConversationList conversations={chat.conversations} customers={customers} activeId={chat.activeConversation?.id} onSelect={selectConversation} />
            )}
          </aside>

          <section className={cn("min-w-0 flex-1 flex-col overflow-hidden bg-background md:flex", chat.activeConversation ? "flex" : "hidden")}>
            {(chat.error || (!orderOpen && ordersStore.error)) && (
              <div className="flex items-start gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
                <p className="flex-1">{chat.error ?? ordersStore.error}</p>
                <button type="button" onClick={() => { chat.clearError(); ordersStore.clearError(); }} aria-label="Dismiss" className="rounded p-0.5 hover:bg-destructive/10"><X className="size-4" /></button>
              </div>
            )}
            {chat.activeConversation ? (
              <ChatWindow
                conversation={chat.activeConversation}
                customer={activeCustomer}
                loading={chat.messagesLoading}
                onSend={send}
                onStatusChange={changeStatus}
                onCreateOrder={() => { ordersStore.clearError(); setOrderDraft(null); setOrderOpen(true); }}
                onDraftOrder={draftOrder}
                draftingOrder={ordersStore.drafting}
                isLiveChannel={chat.activeConversation.source === "channel"}
                onBack={() => chat.setActiveConversation(null)}
                onToggleDetails={() => setDetailsOpen(true)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-muted-foreground">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary"><Bot className="size-7" /></div>
                <p className="font-medium text-foreground">Your unified inbox</p>
                <p className="mt-1 max-w-sm text-sm leading-6">Select a Messenger or Telegram conversation to reply, review orders, and manage the handoff between you and Apsara.</p>
              </div>
            )}
          </section>

          {context && <aside className="hidden w-80 shrink-0 border-l xl:block">{context}</aside>}
        </main>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="gap-0 p-0 xl:hidden">
          <SheetHeader className="border-b"><SheetTitle>Customer details</SheetTitle></SheetHeader>
          <div className="min-h-0 flex-1">{context}</div>
        </SheetContent>
      </Sheet>

      <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} customers={customers} onCreate={createConversation} />

      {(chat.activeConversation || orderDraft) && (
        <NewOrderDialog
          open={orderOpen}
          onOpenChange={(open) => { setOrderOpen(open); if (!open) setOrderDraft(null); }}
          customers={customers}
          products={products}
          lockedCustomerId={orderDraft?.customer_id ?? chat.activeConversation?.customer_id}
          conversationId={orderDraft?.conversation_id ?? chat.activeConversation?.id}
          initialDraft={orderDraft}
          onCreate={createOrder}
          error={ordersStore.error}
          onDismissError={ordersStore.clearError}
        />
      )}
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Inbox; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 border-r px-4 py-3 last:border-r-0">
      <div className="rounded-lg bg-background p-2 text-primary ring-1 ring-foreground/10"><Icon className="size-4" /></div>
      <div><p className="text-base font-semibold tabular-nums">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
    </div>
  );
}
