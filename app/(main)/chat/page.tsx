"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Bot, Clock3, Inbox, MessageCircle, Plus, Search, UserRound, X } from "lucide-react";
import AppHeader from "@/components/header";
import DeepLink from "@/components/shared/deep-link";
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
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";
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
  const t = useAppT("inbox");
  const c = useAppT("common");

  const chat = useChatStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { products, fetchProducts } = useProductsStore();
  const ordersStore = useOrdersStore();
  const {
    activeConversation,
    fetchConversations,
    fetchConversationDetail,
    fetchInboxMetrics,
    openConversation,
  } = chat;
  const { fetchOrders } = ordersStore;

  // `/chat?conversation=<id>` — where the seller lands from a Telegram alert.
  const openFromLink = useCallback((id: string) => { void openConversation(id); }, [openConversation]);

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

  const preset = filters.needs_attention
    ? "needsYou"
    : filters.unread_only
      ? "unread"
      : filters.assignment === "me"
        ? "mine"
        : "all";
  const needsYou = chat.metrics?.needs_attention ?? 0;

  return (
    <>
      <AppHeader title={t.title} description={t.description} />
      <DeepLink param="conversation" onValue={openFromLink} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="hidden grid-cols-5 border-b bg-muted/20 lg:grid">
          <Metric icon={Inbox} label={t.metrics.open} value={chat.metrics?.open ?? 0} />
          <Metric icon={MessageCircle} label={t.metrics.unread} value={chat.metrics?.unread ?? 0} />
          <Metric icon={AlertCircle} label={t.metrics.needsYou} value={needsYou} highlight={needsYou > 0} />
          <Metric icon={UserRound} label={t.metrics.manual} value={chat.metrics?.manual ?? 0} />
          <Metric icon={Clock3} label={t.metrics.response} value={responseTime(chat.metrics?.average_first_response_seconds)} />
        </div>

        <main className="flex min-h-0 flex-1 overflow-hidden">
          <aside className={cn("flex w-full shrink-0 flex-col border-r bg-background md:w-80", chat.activeConversation && "hidden md:flex")}>
            <div className="space-y-3 border-b p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{t.conversations}</p>
                  <p className="text-[11px] text-muted-foreground">{fmt(t.inView, { count: chat.conversations.length })}</p>
                </div>
                <Button size="icon-sm" variant="outline" onClick={() => setDialogOpen(true)} aria-label={t.newRehearsal}>
                  <Plus />
                </Button>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-8" placeholder={t.searchCustomers} />
              </div>
              <div className="grid grid-cols-4 rounded-lg bg-muted p-0.5">
                {(["all", "unread", "needsYou", "mine"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilters((current) => ({
                      ...current,
                      unread_only: item === "unread" || undefined,
                      needs_attention: item === "needsYou" || undefined,
                      assignment: item === "mine" ? "me" : undefined,
                    }))}
                    className={cn("flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium text-muted-foreground transition", preset === item && "bg-background text-foreground shadow-sm")}
                  >
                    {t.presets[item]}
                    {item === "needsYou" && needsYou > 0 && (
                      <span className="grid min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">{needsYou}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={filters.platform ?? ""} onChange={(event) => setFilters((current) => ({ ...current, platform: (event.target.value || undefined) as IInboxFilters["platform"] }))} className={SELECT_CLASS} aria-label={t.filterChannel}>
                  <option value="">{t.allChannels}</option>
                  <option value="messenger">{c.messenger}</option>
                  <option value="telegram">{c.telegram}</option>
                </select>
                <select value={filters.status ?? ""} onChange={(event) => setFilters((current) => ({ ...current, status: (event.target.value || undefined) as IInboxFilters["status"] }))} className={SELECT_CLASS} aria-label={t.filterStatus}>
                  <option value="">{t.anyStatus}</option>
                  <option value="open">{t.status.open}</option>
                  <option value="pending">{t.status.pending}</option>
                  <option value="closed">{t.status.closed}</option>
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
                <button type="button" onClick={() => { chat.clearError(); ordersStore.clearError(); }} aria-label={c.dismiss} className="rounded p-0.5 hover:bg-destructive/10"><X className="size-4" /></button>
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
                <p className="font-medium text-foreground">{t.emptyTitle}</p>
                <p className="mt-1 max-w-sm text-sm leading-6">{t.emptyBody}</p>
              </div>
            )}
          </section>

          {context && <aside className="hidden w-80 shrink-0 border-l xl:block">{context}</aside>}
        </main>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="gap-0 p-0 xl:hidden">
          <SheetHeader className="border-b"><SheetTitle>{t.customerDetails}</SheetTitle></SheetHeader>
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

function Metric({ icon: Icon, label, value, highlight }: { icon: typeof Inbox; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-r px-4 py-3 last:border-r-0">
      <div className={cn("rounded-lg bg-background p-2 ring-1 ring-foreground/10", highlight ? "text-amber-600" : "text-primary")}><Icon className="size-4" /></div>
      <div><p className="text-base font-semibold tabular-nums">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
    </div>
  );
}
