"use client";

import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PLATFORM_COPY } from "@/utils/constants/integration.constant";
import { formatDate } from "@/utils/functions/date";
import { IIntegrationCardProps } from "./props";

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (insecure origin, denied permission).
      // The value is on screen and selectable, so this is not worth an error.
      setCopied(false);
    }
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-muted px-2 py-1.5 font-mono text-xs">
          {value}
        </code>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="shrink-0"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function IntegrationCard({
  integration,
  onToggleAutoReply,
  onToggleActive,
  onDisconnect,
  busy,
}: IIntegrationCardProps) {
  const copy = PLATFORM_COPY[integration.platform];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            {integration.display_name || copy.label}
            <Badge
              className={
                integration.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }
            >
              {integration.is_active ? "Connected" : "Paused"}
            </Badge>
          </CardTitle>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {copy.label} · {integration.external_id} · added{" "}
            {formatDate(integration.created_at)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          onClick={onDisconnect}
          aria-label="Disconnect"
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── What to paste into the platform */}
        <CopyableField label="Callback URL" value={integration.webhook_url} />
        {integration.webhook_secret && (
          <CopyableField label="Secret token" value={integration.webhook_secret} />
        )}

        <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {/* ── Switches. Native checkboxes: the project has no switch component,
               and a labelled checkbox is keyboard- and screen-reader-correct
               without one. */}
        <div className="space-y-2 border-t pt-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={integration.auto_reply}
              disabled={busy}
              onChange={(e) => onToggleAutoReply(e.target.checked)}
            />
            Let the assistant reply automatically
          </label>
          <p className="pl-6 text-xs text-muted-foreground">
            Off, messages still arrive in Chat — you answer them yourself.
          </p>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={integration.is_active}
              disabled={busy}
              onChange={(e) => onToggleActive(e.target.checked)}
            />
            Receive messages from this {copy.label} connection
          </label>
          <p className="pl-6 text-xs text-muted-foreground">
            Off, incoming messages are ignored entirely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
