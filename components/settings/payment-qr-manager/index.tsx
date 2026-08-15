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

export default function PaymentQrManager() {
  const { qrs, loading, error, fetchQrs, createQr, updateQr, deleteQr, clearError } =
    usePaymentQrsStore();
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
    if (!confirm(`Delete ${qrName}? Customers with its old link will no longer see it.`)) return;
    await deleteQr(id);
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-base">Bank payment QR codes</CardTitle>
        <CardDescription>
          Upload up to five bank QRs. Apsara sends the one marked as default.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {qrs.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {qrs.map((qr) => (
              <div key={qr.id} className="flex gap-3 rounded-lg border p-3">
                {/* Public dynamic media URL used by chat platforms too. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr.url} alt={`${qr.name} QR`} className="h-24 w-24 shrink-0 rounded-md border bg-white object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-medium">{qr.name}</p>
                    {qr.is_default && <Badge><Star className="fill-current" /> Default</Badge>}
                    {!qr.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[qr.bank_name, qr.account_name, qr.currency].filter(Boolean).join(" · ") || "Payment QR"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {!qr.is_default && qr.is_active && (
                      <Button size="xs" variant="outline" disabled={loading} onClick={() => updateQr(qr.id, { is_default: true })}>Make default</Button>
                    )}
                    <Button size="xs" variant="outline" disabled={loading} onClick={() => updateQr(qr.id, { is_active: !qr.is_active })}>
                      {qr.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="icon-xs" variant="destructive" disabled={loading} aria-label={`Delete ${qr.name}`} onClick={() => removeQr(qr.id, qr.name)}><Trash2 /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {qrs.length < 5 && (
          <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><Plus className="h-4 w-4" /> Add bank QR</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="qr-name">Display name *</Label>
                <Input id="qr-name" value={name} maxLength={100} placeholder="ABA USD" onChange={(event) => setName(event.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-bank">Bank</Label>
                <Input id="qr-bank" value={bankName} maxLength={100} placeholder="ABA Bank" onChange={(event) => setBankName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-account">Account name</Label>
                <Input id="qr-account" value={accountName} maxLength={100} placeholder="Sok Dara" onChange={(event) => setAccountName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-currency">Currency</Label>
                <select id="qr-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={SHARED_SELECT_CLASS}>
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-qr-file">QR image *</Label>
              <Input id="payment-qr-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} required />
              <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP. Maximum 5 MB.</p>
            </div>
            <Button type="submit" disabled={loading || !file || !name.trim()}>
              <CreditCard /> {loading ? "Uploading…" : "Upload QR"}
            </Button>
          </form>
        )}

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
