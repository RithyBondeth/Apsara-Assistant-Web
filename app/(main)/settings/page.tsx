"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import AppHeader from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { CURRENCIES, formatMoney, sampleAmount } from "@/utils/functions/money";
import { IUser } from "@/utils/interfaces/auth/auth.interface";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <AppHeader title="Settings" />
      <main className="flex-1 p-6">
        {/* The form seeds its fields from the user, so it is mounted only once
            there is one — seeding through an effect instead would mean a
            second render pass and a state write from inside the effect. */}
        {user ? (
          <ProfileForm key={user.id} user={user} />
        ) : (
          <Skeleton className="h-80 max-w-xl rounded-xl" />
        )}
      </main>
    </>
  );
}

function ProfileForm({ user }: { user: IUser }) {
  // ── API Integration
  const { loading, error, updateProfile, clearError } = useAuthStore();

  // ── All States
  const [fullName, setFullName] = useState(user.full_name);
  const [businessName, setBusinessName] = useState(user.business_name ?? "");
  const [currency, setCurrency] = useState(user.currency);
  const [paymentQrUrl, setPaymentQrUrl] = useState(user.payment_qr_url ?? "");
  const [saved, setSaved] = useState(false);

  // ── Derived
  const dirty =
    fullName !== user.full_name ||
    businessName !== (user.business_name ?? "") ||
    currency !== user.currency ||
    paymentQrUrl.trim() !== (user.payment_qr_url ?? "");
  const switchingCurrency = currency !== user.currency;
  // Only a full link can be shown, and only a full link can be sent — the API
  // rejects anything the chat platforms could not fetch for themselves.
  const qrPreview = /^https?:\/\//.test(paymentQrUrl.trim())
    ? paymentQrUrl.trim()
    : null;

  // ── Methods
  async function handleSave() {
    clearError();
    const ok = await updateProfile({
      full_name: fullName.trim(),
      business_name: businessName.trim(),
      currency,
      // null, not "", is what clears it on the server.
      payment_qr_url: paymentQrUrl.trim() || null,
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  // ── Render UI
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">Your business</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">Your name</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="business-name">Business name</Label>
          <Input
            id="business-name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Shown to customers by the assistant"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={SHARED_SELECT_CLASS}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Your catalogue prices are read as this currency — for example{" "}
            {formatMoney(sampleAmount(currency), currency)}. The assistant
            quotes customers in it too.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment-qr">Payment QR link</Label>
          <Input
            id="payment-qr"
            value={paymentQrUrl}
            onChange={(e) => setPaymentQrUrl(e.target.value)}
            placeholder="https://…/my-khqr.png"
          />
          <p className="text-xs text-muted-foreground">
            A link to your KHQR, ABA or Wing code. The assistant sends it to a
            customer who is ready to pay, then asks them for the receipt.
            Messenger and Telegram fetch the image from this link, so it has to
            be one anyone can open. Leave it empty and the assistant never
            offers a QR.
          </p>
          {qrPreview && (
            /* The seller checks their own link here rather than discovering a
               broken one from a customer. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrPreview}
              alt="Your payment QR"
              className="mt-1 h-32 w-32 rounded-lg border bg-white object-contain"
            />
          )}
        </div>

        {/* Switching reinterprets existing prices rather than converting them,
            which is a decision the seller should make knowingly. */}
        {switchingCurrency && (
          <p className="rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
            Changing currency does not convert your prices. A product priced{" "}
            {formatMoney(12.5, user.currency)} stays the number 12.50 and is
            simply read as {formatMoney(12.5, currency)}. Orders you have
            already taken keep the currency they were placed in.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
