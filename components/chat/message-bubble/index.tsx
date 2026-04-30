import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { IMessageBubbleProps } from "./props";

export default function MessageBubble({ message }: IMessageBubbleProps) {
  const isOutgoing = message.sender_type === "assistant";

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isOutgoing ? "items-end" : "items-start"
      )}
    >
      <span className="px-1 text-[10px] text-muted-foreground">
        {isOutgoing ? "Apsara AI" : "Customer"}
      </span>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isOutgoing
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground"
        )}
      >
        {message.content ?? <em className="opacity-60">Empty message</em>}
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {timeAgo(message.created_at)}
      </span>
    </div>
  );
}
