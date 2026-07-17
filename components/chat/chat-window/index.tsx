"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ChevronDown } from "lucide-react";
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
import { PLATFORM_BY_ID } from "@/utils/constants/platforms.constant";
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
}: IChatWindowProps) {
  /* ------------------------------- Translations ----------------------------- */
  const t = useT("chat");
  const tc = useT("common");

  /* -------------------------------- All States ------------------------------ */
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isClosed = conversation.status === "closed";
  const displayName =
    customer?.name ??
    fmt(t.customerFallback, { id: conversation.customer_id.slice(0, 8) });

  /* --------------------------------- Effects --------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  /* --------------------------------- Methods --------------------------------- */
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
        ) : (
          <>
            <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2">
              <textarea
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t.inputPlaceholder}
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
              {t.inputHint}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
