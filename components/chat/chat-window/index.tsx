"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Bot, Send, ChevronDown, PanelRight, ShoppingCart, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageBubble from "@/components/chat/message-bubble";
import { cn } from "@/lib/utils";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";
import { IChatWindowProps } from "./props";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-muted text-muted-foreground",
};

type TStatus = "open" | "closed" | "pending";
type TAction = "markPending" | "closeConversation" | "reopen";

// Which moves are offered from each status; the labels live in the
// translations under `inbox.window`.
const NEXT_STATUSES: Record<string, { label: TAction; value: TStatus }[]> = {
  open: [
    { label: "markPending", value: "pending" },
    { label: "closeConversation", value: "closed" },
  ],
  pending: [
    { label: "reopen", value: "open" },
    { label: "closeConversation", value: "closed" },
  ],
  closed: [{ label: "reopen", value: "open" }],
};

export default function ChatWindow({
  conversation,
  customer,
  loading,
  onSend,
  onStatusChange,
  onCreateOrder,
  onDraftOrder,
  draftingOrder,
  isLiveChannel,
  onBack,
  onToggleDetails,
}: IChatWindowProps) {
  // ── All States
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = useAppT("inbox");
  const w = t.window;

  const isClosed = conversation.status === "closed";
  const displayName =
    customer?.name ?? fmt(t.list.customerFallback, { id: conversation.customer_id.slice(0, 8) });

  // ── Effects
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  // ── Methods
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isClosed) return;
    setInput("");
    setSending(true);
    await onSend(trimmed);
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Render UI
  return (
    <div className="flex h-full flex-col">
      {/* ── Chat header */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              aria-label={w.back}
              className="md:hidden"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="truncate capitalize">{customer?.phone ?? conversation.platform}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {conversation.handling_mode === "auto" ? <Bot className="size-3" /> : <UserRound className="size-3" />}
                {conversation.handling_mode === "auto" ? w.aiReplying : w.youReplying}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {onToggleDetails && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleDetails}
              aria-label={w.openDetails}
              className="xl:hidden"
            >
              <PanelRight className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDraftOrder}
            disabled={draftingOrder || conversation.messages.length === 0}
            aria-label={draftingOrder ? w.drafting : w.draftOrderAria}
            className="size-8 px-0 lg:w-auto lg:px-2.5"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden lg:inline">
              {draftingOrder ? w.drafting : w.draftOrder}
            </span>
          </Button>
          {/* ── The assistant collects order details but cannot confirm a
                 sale, so the handoff to a real order happens here. */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateOrder}
            aria-label={w.createOrder}
            className="size-8 px-0 lg:w-auto lg:px-2.5"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden lg:inline">{w.createOrder}</span>
          </Button>

          {/* ── Status control */}
          <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Badge className={cn(STATUS_STYLES[conversation.status])}>
              {t.status[conversation.status as TStatus] ?? conversation.status}
            </Badge>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(NEXT_STATUSES[conversation.status] ?? []).map((action) => (
                <DropdownMenuItem
                  key={action.value}
                  onClick={() => onStatusChange(action.value)}
                >
                  {w[action.label]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Why the seller was called here */}
      {conversation.needs_attention_at && (
        <div className="flex items-center gap-2 border-b bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="size-3.5 shrink-0" />
          {w.needsYouNotice}
        </div>
      )}

      {/* ── Messages */}
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
          <p className="py-12 text-center text-sm text-muted-foreground">{w.noMessages}</p>
        ) : (
          <div className="space-y-3">
            {conversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input */}
      <div className="border-t px-4 py-3">
        {isClosed ? (
          <p className="text-center text-sm text-muted-foreground">
            {w.closedNotice}{" "}
            <button
              className="font-medium underline-offset-4 hover:underline"
              onClick={() => onStatusChange("open")}
            >
              {w.reopenIt}
            </button>{" "}
            {w.toSend}
          </p>
        ) : (
          <>
            <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2">
              <textarea
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={w.placeholder}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="icon"
                className="h-7 w-7 shrink-0"
                disabled={!input.trim() || sending}
                onClick={handleSend}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              {w.hint} · {isLiveChannel ? w.sendsToCustomer : w.rehearsal}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
