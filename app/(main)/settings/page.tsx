"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import AppHeader from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { CURRENCIES, formatMoney, sampleAmount } from "@/utils/functions/money";
import { IUser } from "@/utils/interfaces/auth/auth.interface";
import PaymentQrManager from "@/components/settings/payment-qr-manager";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <AppHeader
        title="Settings"
        description="Manage the business details Apsara uses with customers"
      />
      <main className="flex-1 p-4 text-left sm:p-6 lg:p-8">
        {/* The form seeds its fields from the user, so it is mounted only once
            there is one — seeding through an effect instead would mean a
            second render pass and a state write from inside the effect. */}
        {user ? (
          <div className="space-y-6">
            <ProfileForm key={user.id} user={user} />
            <PaymentQrManager />
            <LowStockNotifications user={user} />
          </div>
        ) : (
          <Skeleton className="h-80 max-w-xl rounded-xl" />
        )}
      </main>
    </>
  );
}

function LowStockNotifications({user}:{user:IUser}) {
  const {loading,updateProfile}=useAuthStore();
  const [email,setEmail]=useState(user.low_stock_email_enabled ?? true);
  const [telegram,setTelegram]=useState(user.low_stock_telegram_enabled ?? false);
  const [chatId,setChatId]=useState(user.low_stock_telegram_chat_id ?? "");
  return <Card className="max-w-xl text-left"><CardHeader className="border-b"><CardTitle>Low-stock notifications</CardTitle><CardDescription>Choose where you want to receive automatic stock alerts.</CardDescription></CardHeader><CardContent className="space-y-4">
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"><input className="mt-0.5 size-4 accent-primary" type="checkbox" checked={email} onChange={e=>setEmail(e.target.checked)}/><span><span className="block font-medium">Email alerts</span><span className="mt-0.5 block text-xs text-muted-foreground">Send an email when a product reaches its low-stock threshold.</span></span></label>
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"><input className="mt-0.5 size-4 accent-primary" type="checkbox" checked={telegram} onChange={e=>setTelegram(e.target.checked)}/><span><span className="block font-medium">Telegram alerts</span><span className="mt-0.5 block text-xs text-muted-foreground">Send the same alert to your Telegram chat.</span></span></label>
    {telegram&&<div className="space-y-1.5"><Label htmlFor="telegram-alert-chat">Telegram chat ID</Label><Input id="telegram-alert-chat" value={chatId} onChange={e=>setChatId(e.target.value)} placeholder="Your Telegram chat ID"/><p className="text-xs text-muted-foreground">Message your connected bot first, then use that chat&apos;s numeric ID.</p></div>}
    <Button disabled={loading||telegram&&!chatId.trim()} onClick={()=>updateProfile({low_stock_email_enabled:email,low_stock_telegram_enabled:telegram,low_stock_telegram_chat_id:chatId.trim()||null})}>Save notifications</Button>
  </CardContent></Card>;
}

function ProfileForm({ user }: { user: IUser }) {
  // ── API Integration
  const { loading, error, updateProfile, clearError } = useAuthStore();

  // ── All States
  const [fullName, setFullName] = useState(user.full_name);
  const [businessName, setBusinessName] = useState(user.business_name ?? "");
  const [currency, setCurrency] = useState(user.currency);
  const [saved, setSaved] = useState(false);

  // ── Derived
  const dirty =
    fullName !== user.full_name ||
    businessName !== (user.business_name ?? "") ||
    currency !== user.currency;
  const switchingCurrency = currency !== user.currency;
  const nameInvalid = fullName.trim().length === 0;

  // ── Methods
  async function handleSave() {
    clearError();
    const ok = await updateProfile({
      full_name: fullName.trim(),
      business_name: businessName.trim(),
      currency,
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
            aria-invalid={nameInvalid}
            aria-describedby={nameInvalid ? "full-name-error" : undefined}
          />
          {nameInvalid && (
            <p id="full-name-error" className="text-xs text-destructive">
              Your name cannot be empty.
            </p>
          )}
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
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || loading || nameInvalid}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
          {saved && (
            <span role="status" className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
