import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { SenderType } from "@/utils/interfaces/chat/chat.interface";
import { useT } from "@/hooks/utils/use-translations";
import { IMessageBubbleProps } from "./props";

export default function MessageBubble({ message }: IMessageBubbleProps) {
  const t = useT("chat");

  const senderLabels: Record<SenderType, string> = {
    customer: t.customer,
    assistant: t.assistant,
    seller: t.seller,
  };

  // Both the AI and the seller's own manual replies are outgoing; only the
  // customer's messages arrive from the other side.
  const isOutgoing = message.sender_type !== "customer";
  const isSeller = message.sender_type === "seller";

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isOutgoing ? "items-end" : "items-start"
      )}
    >
      <span className="px-1 text-[10px] text-muted-foreground">
        {senderLabels[message.sender_type] ?? message.sender_type}
      </span>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          !isOutgoing && "rounded-tl-sm bg-muted text-foreground",
          // A seller's own reply is visually distinct from an AI one, so it's
          // clear at a glance which replies were handled by a human.
          isOutgoing && isSeller && "rounded-tr-sm bg-secondary text-secondary-foreground",
          isOutgoing && !isSeller && "rounded-tr-sm bg-primary text-primary-foreground"
        )}
      >
        {message.content ?? <em className="opacity-60">{t.emptyMessage}</em>}
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {timeAgo(message.created_at)}
      </span>
    </div>
  );
}
