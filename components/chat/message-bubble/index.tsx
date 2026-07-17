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

  const images = message.attachments.filter((a) =>
    (a.file_type ?? "").startsWith("image")
  );
  // A photo with no caption is a real message, not an empty one — customers
  // often just send the product picture.
  const hasBody = Boolean(message.content) || images.length > 0;

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
          "max-w-[75%] overflow-hidden rounded-2xl text-sm leading-relaxed",
          // Padding moves onto the text so a photo can go edge-to-edge.
          !isOutgoing && "rounded-tl-sm bg-muted text-foreground",
          // A seller's own reply is visually distinct from an AI one, so it's
          // clear at a glance which replies were handled by a human.
          isOutgoing && isSeller && "rounded-tr-sm bg-secondary text-secondary-foreground",
          isOutgoing && !isSeller && "rounded-tr-sm bg-primary text-primary-foreground"
        )}
      >
        {images.map((att) => (
          /* Opens the original: the seller often needs to zoom in on a detail
             the thumbnail loses. */
          <a
            key={att.id}
            href={att.file_url}
            target="_blank"
            rel="noreferrer"
            title={t.viewFullSize}
            className="block"
          >
            {/* Cloudinary hosts these, so next/image would need a
                remotePatterns entry. A plain img keeps this drop-in. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.file_url}
              alt={att.file_name ?? t.photoAlt}
              className="max-h-72 w-full object-cover"
            />
          </a>
        ))}

        {message.content ? (
          <p className="whitespace-pre-wrap px-3.5 py-2">{message.content}</p>
        ) : (
          !hasBody && (
            <p className="px-3.5 py-2">
              <em className="opacity-60">{t.emptyMessage}</em>
            </p>
          )
        )}
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {timeAgo(message.created_at)}
      </span>
    </div>
  );
}
