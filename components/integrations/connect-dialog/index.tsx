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
import { IIntegrationCreate } from "@/utils/interfaces/integration/integration.interface";
import { IConnectDialogProps } from "./props";

interface IConnectFormProps {
  platform: IPlatformMeta;
  onConnect: (data: IIntegrationCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * The credential fields live in their own component so the form resets by
 * unmounting — both when the dialog closes and, via the `key` below, when the
 * seller switches platform. That avoids resetting state from an effect.
 */
function ConnectForm({ platform, onConnect, onCancel, loading, error }: IConnectFormProps) {
  const t = useT("channels");
  const copy = platformCopy(t.platforms, platform.id);

  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const missing = platform.fields.filter((f) => f.required && !values[f.name]?.trim());

  async function handleConnect() {
    setTouched(true);
    if (missing.length > 0) return;

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
          {t.connectTitle.replace("{name}", platform.name)}
        </DialogTitle>
        <DialogDescription>{copy.setupNote}</DialogDescription>
      </DialogHeader>

      {/* ── Setup steps */}
      <ol className="list-decimal space-y-1 rounded-lg bg-muted/50 py-3 pl-8 pr-3 text-xs text-muted-foreground">
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {/* ── Credential fields */}
      <div className="max-h-[40vh] space-y-4 overflow-y-auto py-1">
        {platform.fields.map((field) => {
          const fieldCopy = copy.fields[field.name];
          if (!fieldCopy) return null;

          const invalid = touched && field.required && !values[field.name]?.trim();
          return (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name} className="text-sm">
                {fieldCopy.label}
                {field.required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.secret ? "password" : "text"}
                autoComplete="off"
                placeholder={fieldCopy.placeholder}
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
        <Button onClick={handleConnect} disabled={loading}>
          {loading && <LucideLoader2 className="mr-1.5 size-4 animate-spin" />}
          {t.connect}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function ConnectDialog({
  platform,
  open,
  onOpenChange,
  onConnect,
  loading,
  error,
}: IConnectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {platform && (
          <ConnectForm
            key={platform.id}
            platform={platform}
            onConnect={onConnect}
            onCancel={() => onOpenChange(false)}
            loading={loading}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
