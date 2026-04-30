import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { IMessageBubbleProps } from "./props";

const SENDER_LABELS: Record<string, string> = {
  ai: "Apsara AI",
  seller: "You",
  customer: "",
};

export default function MessageBubble({ message }: IMessageBubbleProps) {
  const isOutgoing = message.sender === "ai" || message.sender === "seller";

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isOutgoing ? "items-end" : "items-start"
      )}
    >
      {message.sender !== "customer" && (
        <span className="px-1 text-[10px] text-muted-foreground">
          {SENDER_LABELS[message.sender]}
        </span>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isOutgoing
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground"
        )}
      >
        {message.content}
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {timeAgo(message.created_at)}
      </span>
    </div>
  );
}
