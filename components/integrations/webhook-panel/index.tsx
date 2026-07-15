"use client";

import { useState } from "react";
import { LucideCheck, LucideCopy, LucideCircleAlert, LucideCircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { IWebhookPanelProps } from "./props";

export default function WebhookPanel({ result }: IWebhookPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.webhook_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (insecure origin, permissions) — the URL
      // is still selectable in the field, so fail quietly.
    }
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-lg border p-3",
        result.ok ? "border-border bg-muted/40" : "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {result.ok ? (
          <LucideCircleCheck className="size-3.5 text-green-600" />
        ) : (
          <LucideCircleAlert className="size-3.5 text-destructive" />
        )}
        {result.ok ? "Webhook URL" : "Registration failed"}
      </div>

      <div className="flex items-center gap-1.5">
        <code className="flex-1 truncate rounded border bg-background px-2 py-1.5 text-xs">
          {result.webhook_url}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy webhook URL"
          className="flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors hover:bg-muted"
        >
          {copied ? (
            <LucideCheck className="size-3.5 text-green-600" />
          ) : (
            <LucideCopy className="size-3.5" />
          )}
        </button>
      </div>

      {result.detail && (
        <p className="text-xs text-muted-foreground">{result.detail}</p>
      )}
    </div>
  );
}
