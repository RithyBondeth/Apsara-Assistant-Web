"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CreditCard, Plus, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { usePaymentQrsStore } from "@/stores/apis/payment-qrs/payment-qrs.store";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

export default function PaymentQrManager() {
  const { qrs, loading, error, fetchQrs, createQr, updateQr, deleteQr, clearError } =
    usePaymentQrsStore();
  const t = useAppT("settings").qr;
  const c = useAppT("common");
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchQrs();
  }, [fetchQrs]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    clearError();
    setFile(event.target.files?.[0] ?? null);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !name.trim()) return;
    const ok = await createQr({
      name: name.trim(),
      bank_name: bankName.trim(),
      account_name: accountName.trim(),
      currency,
      file,
    });
    if (ok) {
      setName("");
      setBankName("");
      setAccountName("");
      setCurrency("USD");
      setFile(null);
      const input = document.getElementById("payment-qr-file") as HTMLInputElement | null;
      if (input) input.value = "";
    }
  }

  async function removeQr(id: string, qrName: string) {
    if (!confirm(fmt(t.confirmDelete, { name: qrName }))) return;
    await deleteQr(id);
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {qrs.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {qrs.map((qr) => (
              <div key={qr.id} className="flex gap-3 rounded-lg border p-3">
                {/* Public dynamic media URL used by chat platforms too. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr.url} alt={fmt(t.qrAlt, { name: qr.name })} className="h-24 w-24 shrink-0 rounded-md border bg-white object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-medium">{qr.name}</p>
                    {qr.is_default && <Badge><Star className="fill-current" /> {c.default}</Badge>}
                    {!qr.is_active && <Badge variant="secondary">{c.inactive}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[qr.bank_name, qr.account_name, qr.currency].filter(Boolean).join(" · ") || t.fallbackLabel}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {!qr.is_default && qr.is_active && (
                      <Button size="xs" variant="outline" disabled={loading} onClick={() => updateQr(qr.id, { is_default: true })}>{t.makeDefault}</Button>
                    )}
                    <Button size="xs" variant="outline" disabled={loading} onClick={() => updateQr(qr.id, { is_active: !qr.is_active })}>
                      {qr.is_active ? t.deactivate : t.activate}
                    </Button>
                    <Button size="icon-xs" variant="destructive" disabled={loading} aria-label={fmt(t.deleteQr, { name: qr.name })} onClick={() => removeQr(qr.id, qr.name)}><Trash2 /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {qrs.length < 5 && (
          <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><Plus className="h-4 w-4" /> {t.addQr}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="qr-name">{t.displayName}</Label>
                <Input id="qr-name" value={name} maxLength={100} placeholder="ABA USD" onChange={(event) => setName(event.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-bank">{t.bank}</Label>
                <Input id="qr-bank" value={bankName} maxLength={100} placeholder="ABA Bank" onChange={(event) => setBankName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-account">{t.accountName}</Label>
                <Input id="qr-account" value={accountName} maxLength={100} placeholder="Sok Dara" onChange={(event) => setAccountName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-currency">{c.currency}</Label>
                <select id="qr-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={SHARED_SELECT_CLASS}>
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-qr-file">{t.image}</Label>
              <Input id="payment-qr-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} required />
              <p className="text-xs text-muted-foreground">{t.imageHelp}</p>
            </div>
            <Button type="submit" disabled={loading || !file || !name.trim()}>
              <CreditCard /> {loading ? t.uploading : t.upload}
            </Button>
          </form>
        )}

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
