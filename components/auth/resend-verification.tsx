"use client";

import { useState } from "react";
import { LucideLoader2, LucideMail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { useAppT } from "@/hooks/utils/use-app-translations";

/**
 * Asks for another confirmation link. The API answers the same for any
 * address, so this only ever says one might be on its way.
 *
 * Not a <form>: it sits inside the sign-in form, and forms cannot nest.
 */
export default function ResendVerification({
  email,
  label,
  sentText,
}: {
  /** Known already (just signed up, or typed into sign-in): no field shown. */
  email?: string;
  label: string;
  sentText: string;
}) {
  const a = useAppT("auth");
  const [value, setValue] = useState(email ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!value.trim()) return;
    setSending(true);
    try {
      await api.post(AUTH_API.RESEND_VERIFICATION, { email: value.trim() });
    } catch {
      // Same message either way: the API never says whether the address exists.
    } finally {
      setSending(false);
      setSent(true);
    }
  }

  if (sent) {
    return <p role="status" className="text-center text-sm text-muted-foreground">{sentText}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {!email && (
        <Input
          type="email"
          aria-label={a.email}
          placeholder={a.emailPlaceholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void send();
            }
          }}
        />
      )}
      <Button type="button" onClick={() => void send()} variant="outline" disabled={sending || !value.trim()} className="gap-2 rounded-full">
        {sending ? <LucideLoader2 className="size-4 animate-spin" /> : <LucideMail className="size-4" />}
        {label}
      </Button>
    </div>
  );
}
