"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { IConversationListProps } from "./props";

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "FB",
  telegram: "TG",
  tiktok: "TT",
  website: "WEB",
};

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: IConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-center text-sm text-muted-foreground">
          No conversations yet
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={cn(
            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
            activeId === conv.id && "bg-muted"
          )}
        >
          {/* ── Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {conv.customer_name.charAt(0).toUpperCase()}
          </div>

          {/* ── Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{conv.customer_name}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {conv.last_message_at ? timeAgo(conv.last_message_at) : ""}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <p className="truncate text-xs text-muted-foreground">
                {conv.last_message ?? "No messages"}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {PLATFORM_LABELS[conv.platform] ?? conv.platform}
                </span>
                {conv.unread_count > 0 && (
                  <Badge className="h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
