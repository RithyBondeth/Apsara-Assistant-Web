"use client";

import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/functions/date";
import { useAppT } from "@/hooks/utils/use-app-translations";
import { useLanguage } from "@/components/utils/languages/language-context";
import { IMessageBubbleProps } from "./props";
import { BASE_URL } from "@/utils/constants/apis/base.api.constant";

function attachmentUrl(id: string, publicUrl: string | null) {
  return publicUrl ?? `${BASE_URL}/api/v1/attachments/${encodeURIComponent(id)}/content`;
}

export default function MessageBubble({ message }: IMessageBubbleProps) {
  const inbox = useAppT("inbox");
  const t = inbox.bubble;
  const language = useLanguage();
  const isOutgoing = message.sender_type !== "customer";
  const senderLabel =
    message.sender_type === "seller" ? t.you : isOutgoing ? t.apsara : t.customer;
  // An image message — a receipt, or the shop's payment QR — carries its
  // picture on an attachment and no text, so a bubble showing `content` alone
  // would read as an empty message the customer never got. Voice notes are
  // audio attachments the seller can play; a video, sticker or file is only
  // recorded by type.
  const audio = message.attachments.filter((a) => (a.file_type ?? "").startsWith("audio/"));
  const images = message.attachments.filter(
    (a) => !audio.includes(a) && (a.file_type === "image" || message.message_type === "image")
  );
  const kind = message.message_type;
  const unreadable = ["voice", "video", "sticker", "file", "other"].includes(kind);

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
                src={attachmentUrl(image.id, image.file_url)}
                alt={image.file_name ?? t.attachment}
                className="max-h-56 w-full rounded-lg bg-white object-contain"
              />
            ))}
            {message.content && <p>{message.content}</p>}
          </div>
        ) : audio.length > 0 ? (
          <div className="space-y-1.5">
            {audio.map((clip) => (
              // The bytes come from the authenticated API, like receipt images.
              <audio key={clip.id} controls preload="none" className="max-w-full"
                     src={attachmentUrl(clip.id, clip.file_url)}>
                {t.audioUnsupported}
              </audio>
            ))}
            {message.content && <p>{message.content}</p>}
            <p className="text-[11px] opacity-70">{t.cannotRead}</p>
          </div>
        ) : unreadable ? (
          <div className="space-y-1">
            <p>{inbox.kinds[kind as keyof typeof inbox.kinds] ?? inbox.kinds.other}</p>
            {message.content && <p>{message.content}</p>}
            <p className="text-[11px] opacity-70">
              {kind === "voice" ? t.voiceUnavailable : t.cannotRead}
            </p>
          </div>
        ) : (
          message.content ?? <em className="opacity-60">{t.empty}</em>
        )}
      </div>
      <span className="px-1 text-[10px] text-muted-foreground">
        {timeAgo(message.created_at, language)}
      </span>
    </div>
  );
}
