"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";
import { IConversationListProps } from "./props";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-muted text-muted-foreground",
};

const PLATFORM_LABELS: Record<PlatformId, string> = {
  telegram: "TG",
  messenger: "FB",
  instagram: "IG",
  website: "WEB",
};

export default function ConversationList({
  conversations,
  customers,
  activeId,
  onSelect,
}: IConversationListProps) {
  const t = useT("chat");
  const tc = useT("common");

  // ── Build a lookup map for customer names
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-center text-sm text-muted-foreground">
          {t.noConversations}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y overflow-y-auto">
      {conversations.map((conv) => {
        const customer = customerMap[conv.customer_id];
        const displayName =
          customer?.name ??
          fmt(t.customerFallback, { id: conv.customer_id.slice(0, 8) });

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
              activeId === conv.id && "bg-muted"
            )}
          >
            {/* ── Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
              {/* A dot rather than a count: the number of unread messages
                  doesn't change what the seller does about it. */}
              {conv.unread && (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background"
                />
              )}
            </div>

            {/* ── Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm",
                    conv.unread ? "font-semibold" : "font-medium"
                  )}
                >
                  {displayName}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(conv.updated_at)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                {/* Leads the row: this is the one thing that should pull the
                    seller's eye down the list. */}
                {conv.needs_attention && (
                  <Badge
                    className="h-4 gap-0.5 bg-amber-100 px-1.5 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    title={t.aiGaveUp}
                  >
                    <AlertCircle className="size-2.5" />
                    {t.needsYou}
                  </Badge>
                )}
                <Badge className={cn("h-4 px-1.5 text-[10px]", STATUS_STYLES[conv.status])}>
                  {tc.conversationStatus[conv.status]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {PLATFORM_LABELS[conv.platform] ?? conv.platform}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
