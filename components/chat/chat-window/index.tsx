"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MessageBubble from "@/components/chat/message-bubble";
import { IChatWindowProps } from "./props";

export default function ChatWindow({
  conversation,
  messages,
  loading,
  onSend,
}: IChatWindowProps) {
  // ── All States
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Effects
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Methods
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
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

  // ── Render UI
  return (
    <div className="flex h-full flex-col">
      {/* ── Chat header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {conversation.customer_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{conversation.customer_name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {conversation.platform}
            {conversation.customer_phone && ` · ${conversation.customer_phone}`}
          </p>
        </div>
      </div>

      {/* ── Messages */}
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
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input */}
      <div className="border-t px-4 py-3">
        <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2">
          <textarea
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Type a message…"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="icon"
            className="h-7 w-7 shrink-0"
            disabled={!input.trim() || sending}
            onClick={handleSend}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
