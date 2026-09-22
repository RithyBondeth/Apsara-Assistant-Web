"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { platformCopy } from "@/utils/constants/integration.constant";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";
import { IConnectDialogProps } from "./props";

export default function ConnectDialog({
  open,
  onOpenChange,
  ...rest
}: IConnectDialogProps) {
  // Mounted only while open, so each connection starts from empty fields —
  // an access token especially should not linger from an abandoned attempt.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <ConnectForm onOpenChange={onOpenChange} {...rest} />}
      </DialogContent>
    </Dialog>
  );
}

type IConnectFormProps = Omit<IConnectDialogProps, "open">;

function ConnectForm({
  onOpenChange,
  platform,
  onCreate,
  error,
  onDismissError,
}: IConnectFormProps) {
  // ── All States
  const [externalId, setExternalId] = useState("");
  const [token, setToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const t = useAppT("integrations");
  const d = t.dialog;
  const common = useAppT("common");

  const copy = platformCopy(t.platforms)[platform];
  // Stripe is the only platform with a second secret, and it cannot be skipped:
  // without it no payment notification can be told apart from a forged one.
  const needsSecret = platform === "stripe";
  const valid =
    externalId.trim() !== "" &&
    token.trim() !== "" &&
    (!needsSecret || webhookSecret.trim() !== "");

  // ── Methods
  async function handleCreate() {
    if (!valid) return;
    setSaving(true);
    const ok = await onCreate({
      platform,
      external_id: externalId.trim(),
      access_token: token.trim(),
      display_name: displayName.trim() || undefined,
      webhook_secret: needsSecret ? webhookSecret.trim() : undefined,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  // ── Render UI
  return (
    <>
      <DialogHeader>
        <DialogTitle>{fmt(d.title, { platform: copy.label })}</DialogTitle>
        <DialogDescription>
          {needsSecret ? d.stripeDescription : d.channelDescription}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="external-id">{copy.idLabel}</Label>
          <Input
            id="external-id"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{copy.idHint}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="access-token">{copy.tokenLabel}</Label>
          <Input
            id="access-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{copy.tokenHint}</p>
        </div>

        {needsSecret && (
          <div className="space-y-1.5">
            <Label htmlFor="webhook-secret">{copy.secretLabel}</Label>
            <Input
              id="webhook-secret"
              type="password"
              autoComplete="off"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{copy.secretHint}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="display-name">{d.label}</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={d.labelPlaceholder}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={onDismissError}
              aria-label={common.dismiss}
              className="shrink-0 rounded p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {common.cancel}
        </Button>
        <Button onClick={handleCreate} disabled={!valid || saving}>
          {saving ? d.connecting : d.connect}
        </Button>
      </DialogFooter>
    </>
  );
}
