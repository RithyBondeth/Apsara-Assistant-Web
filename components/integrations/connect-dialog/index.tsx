"use client";

import { useState } from "react";
import { LucideLoader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/utils/use-translations";
import { IPlatformMeta, platformCopy } from "@/utils/constants/platforms.constant";
import {
  IIntegration,
  IIntegrationCreate,
  IIntegrationUpdate,
} from "@/utils/interfaces/integration/integration.interface";
import { IConnectDialogProps } from "./props";

interface IConnectFormProps {
  platform: IPlatformMeta;
  integration?: IIntegration | null;
  onConnect: (data: IIntegrationCreate) => Promise<void>;
  onUpdate?: (id: string, data: IIntegrationUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * The credential fields live in their own component so the form resets by
 * unmounting — both when the dialog closes and, via the `key` below, when the
 * seller switches platform. That avoids resetting state from an effect.
 *
 * Edit mode reuses the same field list — the credentials a channel needs don't
 * change once it's connected, only their values do. What changes is what a
 * blank field MEANS: on create it's "not provided", on edit it's "keep the
 * stored value", because the API never returns credentials for us to prefill.
 * That's also why nothing is required in edit mode: a seller rotating an
 * expired bot token shouldn't have to re-paste an unrelated app secret.
 */
function ConnectForm({
  platform,
  integration,
  onConnect,
  onUpdate,
  onCancel,
  loading,
  error,
}: IConnectFormProps) {
  const t = useT("channels");
  const copy = platformCopy(t.platforms, platform.id);
  const editing = Boolean(integration);

  // external_id is the one field the API does return, so it can be prefilled.
  const [values, setValues] = useState<Record<string, string>>(
    integration?.external_id ? { external_id: integration.external_id } : {}
  );
  const [touched, setTouched] = useState(false);

  const missing = editing
    ? []
    : platform.fields.filter((f) => f.required && !values[f.name]?.trim());

  async function handleSubmit() {
    setTouched(true);
    if (missing.length > 0) return;

    if (editing && integration && onUpdate) {
      // Send only what the seller actually typed. Omitting a field leaves the
      // stored credential untouched — that's the whole point of edit mode.
      const payload: IIntegrationUpdate = {};
      for (const field of platform.fields) {
        const value = values[field.name]?.trim();
        if (value) payload[field.name] = value;
      }
      await onUpdate(integration.id, payload);
      return;
    }

    // Only send fields the seller actually filled in — a blank secret_token
    // means "no allowlist", which is different from an empty string.
    const payload: IIntegrationCreate = { platform: platform.id, access_token: "" };
    for (const field of platform.fields) {
      const value = values[field.name]?.trim();
      if (value) payload[field.name] = value;
    }

    await onConnect(payload);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <platform.icon className="size-7 shrink-0 rounded-md" />
          {(editing ? t.editTitle : t.connectTitle).replace("{name}", platform.name)}
        </DialogTitle>
        <DialogDescription>{editing ? t.editNote : copy.setupNote}</DialogDescription>
      </DialogHeader>

      {/* ── Setup steps — only worth reading the first time round ─────────── */}
      {!editing && (
        <ol className="list-decimal space-y-1 rounded-lg bg-muted/50 py-3 pl-8 pr-3 text-xs text-muted-foreground">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}

      {/* ── Credential fields      ────────────────────────────────────────── */}
      <div className="max-h-[40vh] space-y-4 overflow-y-auto py-1">
        {platform.fields.map((field) => {
          const fieldCopy = copy.fields[field.name];
          if (!fieldCopy) return null;

          const required = field.required && !editing;
          const invalid = touched && required && !values[field.name]?.trim();
          return (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name} className="text-sm">
                {fieldCopy.label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.secret ? "password" : "text"}
                autoComplete="off"
                // In edit mode an empty box means "keep the stored value", so
                // it shouldn't advertise an example the seller might think is
                // the current one. Prefilled fields keep their own copy.
                placeholder={
                  editing && !values[field.name]
                    ? t.keepCurrent
                    : fieldCopy.placeholder
                }
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                aria-invalid={invalid}
              />
              {fieldCopy.help && (
                <p className="text-xs text-muted-foreground">{fieldCopy.help}</p>
              )}
              {invalid && (
                <p className="text-xs text-destructive">
                  {t.requiredField.replace("{field}", fieldCopy.label)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {t.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <LucideLoader2 className="mr-1.5 size-4 animate-spin" />}
          {editing ? t.save : t.connect}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function ConnectDialog({
  platform,
  integration,
  open,
  onOpenChange,
  onConnect,
  onUpdate,
  loading,
  error,
}: IConnectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {platform && (
          <ConnectForm
            // Remount per target, so switching platform OR jumping from one
            // connection's edit form to another's clears the typed credentials.
            key={integration?.id ?? platform.id}
            platform={platform}
            integration={integration}
            onConnect={onConnect}
            onUpdate={onUpdate}
            onCancel={() => onOpenChange(false)}
            loading={loading}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
