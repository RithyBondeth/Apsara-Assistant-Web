"use client";

import { Bot, MessageCircle, Send, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { IConversationListProps } from "./props";

const STATUS_DOT: Record<string, string> = {
  open: "bg-emerald-500",
  pending: "bg-amber-500",
  closed: "bg-muted-foreground/40",
};

export default function ConversationList({
  conversations,
  customers,
  activeId,
  onSelect,
}: IConversationListProps) {
  const customerMap = Object.fromEntries(customers.map((customer) => [customer.id, customer]));

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 rounded-xl bg-muted p-3">
          <MessageCircle className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No conversations found</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Try another filter or wait for a new customer message.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-2">
      {conversations.map((conversation) => {
        const customer = customerMap[conversation.customer_id];
        const displayName = customer?.name ?? `Customer ${conversation.customer_id.slice(0, 8)}`;
        const unread = conversation.unread_count > 0;

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={cn(
              "mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/70",
              activeId === conversation.id && "bg-primary/[0.07] ring-1 ring-primary/15",
            )}
          >
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
              {displayName.charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border-2 border-background bg-background">
                {conversation.platform === "telegram" ? (
                  <Send className="size-2.5 text-sky-500" />
                ) : (
                  <MessageCircle className="size-2.5 text-blue-600" />
                )}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-semibold" : "font-medium")}>
                  {displayName}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(conversation.updated_at)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[conversation.status])} />
                <p className={cn("min-w-0 flex-1 truncate text-xs text-muted-foreground", unread && "font-medium text-foreground/75")}>
                  {conversation.last_message_sender === "seller" ? "You: " : ""}
                  {conversation.last_message_sender === "assistant" ? "Apsara: " : ""}
                  {conversation.last_message_preview ?? "No messages yet"}
                </p>
                {unread && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                  </span>
                )}
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-1.5">
                <Badge variant="outline" className="h-4 gap-1 px-1.5 text-[10px] capitalize">
                  {conversation.handling_mode !== "manual" ? <Bot className="size-2.5" /> : <UserRound className="size-2.5" />}
                  {conversation.handling_mode !== "manual" ? "AI" : "You"}
                </Badge>
                {(conversation.tags ?? []).slice(0, 2).map((tag) => (
                  <span key={tag.id} className="max-w-20 truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
