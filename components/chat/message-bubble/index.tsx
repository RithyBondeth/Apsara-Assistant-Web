import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { IMessageBubbleProps } from "./props";

export default function MessageBubble({ message }: IMessageBubbleProps) {
  const isOutgoing = message.sender_type !== "customer";
  const senderLabel =
    message.sender_type === "seller" ? "You" : isOutgoing ? "Apsara AI" : "Customer";
  // An image message — today only the shop's payment QR — carries its picture
  // on an attachment and no text, so a bubble showing `content` alone would
  // read as an empty message the customer never got.
  const images = message.attachments.filter(
    (a) => a.file_type === "image" || message.message_type === "image"
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isOutgoing ? "items-end" : "items-start"
      )}
    >
      <span className="px-1 text-[10px] text-muted-foreground">
        {senderLabel}
      </span>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isOutgoing
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground"
        )}
      >
        {images.length > 0 ? (
          <div className="space-y-1.5">
            {images.map((image) => (
              /* Plain <img>: the URL is the seller's own, from any host, and
                 next/image would need every one of them configured. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={image.file_url}
                alt={image.file_name ?? "Attachment"}
                className="max-h-56 w-full rounded-lg bg-white object-contain"
              />
            ))}
            {message.content && <p>{message.content}</p>}
          </div>
        ) : (
          message.content ?? <em className="opacity-60">Empty message</em>
        )}
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {timeAgo(message.created_at)}
      </span>
    </div>
  );
}
