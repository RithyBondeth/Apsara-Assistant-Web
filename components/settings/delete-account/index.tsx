"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { extractErrorMessage } from "@/utils/functions/error";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

/** Close the shop for good. Needs the password, a tick and a confirmation —
 *  this is the one action in the app nothing can bring back. */
export default function DeleteAccount({ shopName }: { shopName: string }) {
  const t = useAppT("settings").danger;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirm(fmt(t.confirmDialog, { shop: shopName }))) return;
    setDeleting(true);
    setError(null);
    try {
      await api.post(AUTH_API.DELETE_ACCOUNT, { password });
      // The session went with the account; forget it here too.
      useAuthStore.setState({ user: null, error: null });
      router.replace("/");
    } catch (err) {
      setError(extractErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <Card className="max-w-xl border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base text-destructive">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="delete-password">{t.password}</Label>
            <Input id="delete-password" type="password" autoComplete="current-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 size-4 accent-destructive"
                   checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
            {t.confirm}
          </label>
          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" variant="destructive" disabled={deleting || !understood || !password}>
            <Trash2 /> {deleting ? t.deleting : t.delete}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
