"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Send,
  ChevronDown,
  Bot,
  UserRound,
  ShoppingCart,
  Loader2 as LucideLoader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageBubble from "@/components/chat/message-bubble";
import { PLATFORM_BY_ID } from "@/utils/constants/platforms.constant";
import { PUSH_PLATFORMS } from "@/utils/constants/platforms.constant";
import api from "@/lib/axios";
import { ORDERS_API } from "@/utils/constants/apis/orders.api.constant";
import { IOrder } from "@/utils/interfaces/order/order.interface";
import {
  ORDER_STATUS_STYLES,
} from "@/utils/constants/orders.constant";
import { formatCurrency } from "@/utils/functions/currency";
import { cn } from "@/lib/utils";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";
import { IChatWindowProps } from "./props";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-muted text-muted-foreground",
};

type ChatCopy = ReturnType<typeof useT<"chat">>;
type NextStatus = { label: string; value: "open" | "closed" | "pending" };

/** Which transitions each status offers, labelled in the active language. */
function nextStatuses(t: ChatCopy): Record<string, NextStatus[]> {
  return {
    open: [
      { label: t.markPending, value: "pending" },
      { label: t.closeConversation, value: "closed" },
    ],
    pending: [
      { label: t.reopen, value: "open" },
      { label: t.closeConversation, value: "closed" },
    ],
    closed: [{ label: t.reopen, value: "open" }],
  };
}

export default function ChatWindow({
  conversation,
  customer,
  loading,
  onSend,
  onStatusChange,
  onAiEnabledChange,
  onLoadOlder,
  loadingOlder,
  sendError,
}: IChatWindowProps) {
  /* ------------------------------- Translations ----------------------------- */
  const t = useT("chat");
  const tc = useT("common");

  /* -------------------------------- All States ------------------------------ */
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [linkedOrders, setLinkedOrders] = useState<IOrder[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Orders raised from this thread. Fetched locally rather than via the orders
  // store so opening a chat doesn't clobber the Orders page's list. Re-runs
  // when a new order is created (conversation.updated_at bumps) or the thread
  // changes.
  useEffect(() => {
    let active = true;
    api
      .get<IOrder[]>(ORDERS_API.LIST, {
        params: { conversation_id: conversation.id },
      })
      .then(({ data }) => {
        if (active) setLinkedOrders(data);
      })
      .catch(() => {
        if (active) setLinkedOrders([]);
      });
    return () => {
      active = false;
    };
  }, [conversation.id, conversation.updated_at]);

  const isClosed = conversation.status === "closed";
  // The website widget is request/response — there's no channel to push a
  // human's reply down, so takeover isn't possible on that platform.
  const canReply = PUSH_PLATFORMS.has(conversation.platform);
  const aiOn = conversation.ai_enabled;
  const displayName =
    customer?.name ??
    fmt(t.customerFallback, { id: conversation.customer_id.slice(0, 8) });

  /* --------------------------------- Effects --------------------------------- */
  // Keyed on the LAST message, not the array: loading older messages prepends,
  // which would otherwise scroll the seller straight back to the bottom and
  // make "load older" look like it did nothing. A new message (or a different
  // thread) does change the last id, so those still scroll into view.
  const lastMessageId = conversation.messages.at(-1)?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageId]);

  /* --------------------------------- Methods --------------------------------- */
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isClosed || !canReply) return;
    setSending(true);
    const ok = await onSend(trimmed);
    setSending(false);
    // Keep the text on failure — it never reached the customer, so silently
    // discarding it would lose what the seller wrote.
    if (ok) setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* -------------------------------- Render UI -------------------------------- */
  return (
    <div className="flex h-full flex-col">
      {/* ── Chat Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{displayName}</p>
            {/* Brand names are deliberately not translated. */}
            <p className="text-xs text-muted-foreground">
              {customer?.phone ??
                PLATFORM_BY_ID[conversation.platform]?.name ??
                conversation.platform}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ── Create order from this chat ────────────────────── */}
          <Link
            href={`/orders/new?customer=${conversation.customer_id}&conversation=${conversation.id}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-7 gap-1.5 text-xs",
            })}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {t.createOrder}
          </Link>

          {/* ── AI on/off ──────────────────────────────────────── */}
          {canReply && (
            <Button
              variant={aiOn ? "ghost" : "secondary"}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              title={aiOn ? t.aiToggleOff : t.aiToggleOn}
              onClick={() => onAiEnabledChange(!aiOn)}
            >
              {aiOn ? (
                <Bot className="h-3.5 w-3.5" />
              ) : (
                <UserRound className="h-3.5 w-3.5" />
              )}
              {aiOn ? t.aiOn : t.aiOff}
            </Button>
          )}

        {/* ── Status Control ───────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t.changeStatus}
            className="flex items-center gap-1 rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Badge className={STATUS_STYLES[conversation.status]}>
              {tc.conversationStatus[conversation.status]}
            </Badge>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(nextStatuses(t)[conversation.status] ?? []).map((action) => (
              <DropdownMenuItem
                key={action.value}
                onClick={() => onStatusChange(action.value)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* ── Orders raised from this thread ─────────────────────── */}
      {linkedOrders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {t.ordersFromChat}:
          </span>
          {linkedOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              title={t.viewOrder}
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs hover:bg-muted"
            >
              <span className="font-mono">#{order.id.slice(0, 8)}</span>
              <span className="font-medium">
                {formatCurrency(order.total_amount)}
              </span>
              <Badge
                className={cn("h-4 px-1.5 text-[10px]", ORDER_STATUS_STYLES[order.status])}
              >
                {tc.orderStatus[order.status]}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* ── Messages ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-10 max-w-[60%] rounded-2xl ${i % 2 === 0 ? "" : "ml-auto"}`}
              />
            ))}
          </div>
        ) : conversation.messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t.noMessages}
          </p>
        ) : (
          <div className="space-y-3">
            {/* Only the newest window arrives with the thread; the rest is a
                click away rather than loaded on every open. */}
            {conversation.messages.length < conversation.message_total && (
              <div className="flex justify-center pb-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingOlder}
                  onClick={() => onLoadOlder()}
                >
                  {loadingOlder && (
                    <LucideLoader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  {fmt(tc.pagination.loadMore, {
                    shown: conversation.messages.length,
                    total: conversation.message_total,
                  })}
                </Button>
              </div>
            )}
            {conversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="border-t px-4 py-3">
        {isClosed ? (
          <p className="text-center text-sm text-muted-foreground">
            {t.closedNotice}{" "}
            <button
              className="font-medium underline-offset-4 hover:underline"
              onClick={() => onStatusChange("open")}
            >
              {t.reopenIt}
            </button>{" "}
            {t.closedNoticeSuffix}
          </p>
        ) : !canReply ? (
          /* Website visitors can only be answered by the AI, when they ask. */
          <p className="text-center text-xs text-muted-foreground">
            {t.websiteNoReply}
          </p>
        ) : (
          <>
            {sendError && (
              <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {t.sendFailed}: {sendError}
              </p>
            )}

            <div
              className={cn(
                "flex items-end gap-2 rounded-xl border bg-background px-3 py-2",
                !aiOn && "border-secondary"
              )}
            >
              <textarea
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t.replyPlaceholder}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="icon"
                aria-label={t.send}
                className="h-7 w-7 shrink-0"
                disabled={!input.trim() || sending}
                onClick={handleSend}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              {aiOn ? t.replyHint : t.aiPausedNote}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
