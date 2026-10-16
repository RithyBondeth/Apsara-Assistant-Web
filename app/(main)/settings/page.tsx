"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2, Send, Unlink } from "lucide-react";
import AppHeader from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { CURRENCIES, DEFAULT_KHR_RATE, formatDual, formatMoney, sampleAmount } from "@/utils/functions/money";
import { ITelegramLink, IUser } from "@/utils/interfaces/auth/auth.interface";
import PaymentQrManager from "@/components/settings/payment-qr-manager";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const t = useAppT("settings");

  return (
    <>
      <AppHeader title={t.title} description={t.description} />
      <main className="flex-1 p-4 text-left sm:p-6 lg:p-8">
        {/* The forms seed their fields from the user, so they are mounted only
            once there is one — seeding through an effect instead would mean a
            second render pass and a state write from inside the effect. */}
        {user ? (
          <div className="space-y-6">
            <ProfileForm key={user.id} user={user} />
            <ShopInformation key={`shop-${user.id}`} user={user} />
            <TelegramAlerts key={`alerts-${user.id}`} user={user} />
            <PaymentQrManager />
          </div>
        ) : (
          <Skeleton className="h-80 max-w-xl rounded-xl" />
        )}
      </main>
    </>
  );
}

// ── Saved indicator shared by the cards ──────────────────────────────────────

function useSavedFlash() {
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return {
    saved,
    flash() {
      setSaved(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSaved(false), 2500);
    },
  };
}

function SavedMark({ show }: { show: boolean }) {
  const c = useAppT("common");
  if (!show) return null;
  return (
    <span role="status" className="flex items-center gap-1 text-sm text-green-600">
      <Check className="h-4 w-4" />
      {c.saved}
    </span>
  );
}

// ── Profile ──────────────────────────────────────────────────────────────────

function ProfileForm({ user }: { user: IUser }) {
  const t = useAppT("settings").profile;
  const c = useAppT("common");
  const { loading, error, updateProfile, clearError } = useAuthStore();

  const [fullName, setFullName] = useState(user.full_name);
  const [businessName, setBusinessName] = useState(user.business_name ?? "");
  const [currency, setCurrency] = useState(user.currency);
  const [khrRate, setKhrRate] = useState(user.khr_rate ?? String(DEFAULT_KHR_RATE));
  const { saved, flash } = useSavedFlash();

  const dirty =
    fullName !== user.full_name ||
    businessName !== (user.business_name ?? "") ||
    currency !== user.currency ||
    khrRate !== (user.khr_rate ?? String(DEFAULT_KHR_RATE));
  const switchingCurrency = currency !== user.currency;
  const nameInvalid = fullName.trim().length === 0;
  // The API bounds this too; catching it here saves a round trip and says
  // why, next to the field.
  const rateValue = parseFloat(khrRate);
  const rateInvalid = !Number.isFinite(rateValue) || rateValue <= 1000 || rateValue >= 20000;

  async function handleSave() {
    clearError();
    const ok = await updateProfile({
      full_name: fullName.trim(),
      business_name: businessName.trim(),
      currency,
      khr_rate: khrRate,
    });
    if (ok) flash();
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">{t.yourName}</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={nameInvalid}
            aria-describedby={nameInvalid ? "full-name-error" : undefined}
          />
          {nameInvalid && (
            <p id="full-name-error" className="text-xs text-destructive">
              {t.nameEmpty}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="business-name">{t.businessName}</Label>
          <Input
            id="business-name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={t.businessPlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency">{t.currency}</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={SHARED_SELECT_CLASS}
          >
            {CURRENCIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {fmt(t.currencyHelp, { example: formatMoney(sampleAmount(currency), currency) })}
          </p>
        </div>

        {/* Cambodia is bimonetary: the catalogue is priced in one currency
            and customers pay in either, so the shop's own rate is what the
            assistant quotes with and what riel receipts are checked against. */}
        <div className="space-y-1.5">
          <Label htmlFor="khr-rate">{t.khrRate}</Label>
          <Input
            id="khr-rate"
            type="number"
            inputMode="numeric"
            min={1001}
            max={19999}
            step={10}
            value={khrRate}
            onChange={(e) => setKhrRate(e.target.value)}
            aria-invalid={rateInvalid}
            aria-describedby={rateInvalid ? "khr-rate-error" : undefined}
          />
          {rateInvalid ? (
            <p id="khr-rate-error" className="text-xs text-destructive">{t.khrRateInvalid}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {fmt(t.khrRateHelp, {
                example: formatDual(sampleAmount(currency), currency, khrRate),
              })}
            </p>
          )}
        </div>

        {/* Switching reinterprets existing prices rather than converting them,
            which is a decision the seller should make knowingly. */}
        {switchingCurrency && (
          <p className="rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
            {fmt(t.switchWarning, {
              before: formatMoney(12.5, user.currency),
              after: formatMoney(12.5, currency),
            })}
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || loading || nameInvalid || rateInvalid}>
            {loading ? c.saving : t.saveChanges}
          </Button>
          <SavedMark show={saved} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Shop information ─────────────────────────────────────────────────────────

const SHOP_FIELDS = ["delivery_info", "shop_address", "shop_hours", "shop_policies"] as const;
type ShopField = (typeof SHOP_FIELDS)[number];

function ShopInformation({ user }: { user: IUser }) {
  const t = useAppT("settings").shop;
  const c = useAppT("common");
  const { loading, error, updateProfile, clearError } = useAuthStore();
  const { saved, flash } = useSavedFlash();

  const [values, setValues] = useState<Record<ShopField, string>>({
    delivery_info: user.delivery_info ?? "",
    shop_address: user.shop_address ?? "",
    shop_hours: user.shop_hours ?? "",
    shop_policies: user.shop_policies ?? "",
  });

  const dirty = SHOP_FIELDS.some((field) => values[field] !== (user[field] ?? ""));

  const fields: { key: ShopField; label: string; placeholder: string; rows: number }[] = [
    { key: "delivery_info", label: t.delivery, placeholder: t.deliveryPlaceholder, rows: 3 },
    { key: "shop_address", label: t.address, placeholder: t.addressPlaceholder, rows: 2 },
    { key: "shop_hours", label: t.hours, placeholder: t.hoursPlaceholder, rows: 2 },
    { key: "shop_policies", label: t.policies, placeholder: t.policiesPlaceholder, rows: 3 },
  ];

  async function handleSave() {
    clearError();
    // An emptied field is sent as null so it clears rather than saving blanks.
    const payload = Object.fromEntries(
      SHOP_FIELDS.map((field) => [field, values[field].trim() || null]),
    );
    if (await updateProfile(payload)) flash();
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`shop-${field.key}`}>{field.label}</Label>
            <Textarea
              id={`shop-${field.key}`}
              value={values[field.key]}
              rows={field.rows}
              maxLength={2000}
              placeholder={field.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{t.help}</p>

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || loading}>
            {loading ? c.saving : t.save}
          </Button>
          <SavedMark show={saved} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Telegram alerts ──────────────────────────────────────────────────────────

// How often to ask whether the seller has pressed Start yet. The bot writes
// the chat id the moment they do; this is only the page catching up.
const LINK_POLL_MS = 3000;

function TelegramAlerts({ user }: { user: IUser }) {
  const t = useAppT("settings").alerts;
  const c = useAppT("common");
  const { loading, error, updateProfile, startTelegramLink, unlinkTelegram, fetchMe, clearError } =
    useAuthStore();
  const { saved, flash } = useSavedFlash();

  const [attention, setAttention] = useState(user.attention_telegram_enabled ?? true);
  const [payment, setPayment] = useState(user.payment_telegram_enabled ?? true);
  const [lowStock, setLowStock] = useState(user.low_stock_telegram_enabled ?? false);
  const [lowStockEmail, setLowStockEmail] = useState(user.low_stock_email_enabled ?? true);
  const [handoffHours, setHandoffHours] = useState(String(user.manual_timeout_hours ?? 12));
  const [pendingLink, setLink] = useState<ITelegramLink | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const linked = Boolean(user.telegram_chat_id);
  // A link on screen is only meaningful until the bot records the chat; once
  // linked it is simply no longer shown, without an effect to clear it.
  const link = linked ? null : pendingLink;
  const dirty =
    attention !== (user.attention_telegram_enabled ?? true) ||
    payment !== (user.payment_telegram_enabled ?? true) ||
    lowStock !== (user.low_stock_telegram_enabled ?? false) ||
    lowStockEmail !== (user.low_stock_email_enabled ?? true) ||
    handoffHours !== String(user.manual_timeout_hours ?? 12);
  // Whole hours, 0 (never resume) to a month — the API's own bounds.
  const handoffValue = Number(handoffHours);
  const handoffInvalid =
    !Number.isInteger(handoffValue) || handoffValue < 0 || handoffValue > 720;

  // While a link is on screen, watch for the bot to record the chat. Stops on
  // its own once linked (the link is cleared) or when the link would have
  // expired anyway.
  useEffect(() => {
    if (!link) return;
    const deadline = Date.now() + link.expires_in_minutes * 60_000;
    const id = window.setInterval(() => {
      if (Date.now() > deadline) {
        window.clearInterval(id);
        setLink(null);
        return;
      }
      fetchMe();
    }, LINK_POLL_MS);
    return () => window.clearInterval(id);
  }, [link, fetchMe]);

  async function beginLink() {
    setLinkError(null);
    const result = await startTelegramLink();
    if ("link" in result) setLink(result.link);
    else setLinkError(result.error);
  }

  async function copyCommand() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(`/start ${link.code}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the text is still visible to select.
    }
  }

  async function handleSave() {
    clearError();
    const ok = await updateProfile({
      attention_telegram_enabled: attention,
      payment_telegram_enabled: payment,
      low_stock_telegram_enabled: lowStock,
      low_stock_email_enabled: lowStockEmail,
      manual_timeout_hours: handoffValue,
    });
    if (ok) flash();
  }

  const needsBot = linkError?.toLowerCase().includes("telegram bot");

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ── Link status */}
        <div className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Send className="size-4 text-primary" />
              {linked ? (
                <>
                  <span className="font-medium">
                    {user.telegram_chat_name
                      ? fmt(t.linkedTo, { name: user.telegram_chat_name })
                      : t.linked}
                  </span>
                  <Badge variant="secondary">{c.active}</Badge>
                </>
              ) : (
                <span className="font-medium">{t.notLinked}</span>
              )}
            </div>
            <div className="flex gap-2">
              {linked ? (
                <>
                  <Button size="sm" variant="outline" onClick={beginLink} disabled={loading}>
                    <Link2 /> {t.relink}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={unlinkTelegram} disabled={loading}>
                    <Unlink /> {t.unlink}
                  </Button>
                </>
              ) : (
                !link && (
                  <Button size="sm" onClick={beginLink} disabled={loading}>
                    <Link2 /> {t.link}
                  </Button>
                )
              )}
            </div>
          </div>

          {!linked && !link && !linkError && (
            <p className="mt-2 text-xs text-muted-foreground">{t.notLinkedHelp}</p>
          )}

          {linkError && (
            <div className="mt-2 space-y-2">
              <p role="alert" className="text-sm text-destructive">
                {needsBot ? t.needBot : linkError}
              </p>
              {needsBot && (
                <Link href="/integrations" className={buttonVariants({ size: "sm", variant: "outline" })}>
                  {t.goToIntegrations}
                </Link>
              )}
            </div>
          )}

          {link && !linked && (
            <div className="mt-3 space-y-3">
              <p className="text-sm">{t.linkReady}</p>
              <a
                href={link.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                <ExternalLink /> {t.openInTelegram}
              </a>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {fmt(t.orSend, { bot: link.bot_username })}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
                    /start {link.code}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyCommand}>
                    <Copy /> {copied ? c.copied : c.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {t.waiting} {fmt(t.expires, { minutes: link.expires_in_minutes })}
              </p>
            </div>
          )}
        </div>

        {/* ── Switches */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t.sendMeWhen}</p>
          <Switch
            id="alert-attention"
            checked={attention}
            onChange={setAttention}
            label={t.attention}
            help={t.attentionHelp}
          />
          <Switch
            id="alert-payment"
            checked={payment}
            onChange={setPayment}
            label={t.payment}
            help={t.paymentHelp}
          />
          <Switch
            id="alert-low-stock"
            checked={lowStock}
            onChange={setLowStock}
            label={t.lowStock}
            help={t.lowStockHelp}
          />
          <Switch
            id="alert-low-stock-email"
            checked={lowStockEmail}
            onChange={setLowStockEmail}
            label={t.lowStockEmail}
          />
        </div>

        {/* Replying to a customer pauses the assistant on that thread; this
            is how long that lasts. Pressing Take over is the other case and
            does not expire. */}
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">{t.handoffTitle}</p>
          <p className="text-xs text-muted-foreground">{t.handoffHelp}</p>
          <div className="space-y-1.5">
            <Label htmlFor="handoff-hours">{t.handoffHours}</Label>
            <Input
              id="handoff-hours"
              type="number"
              inputMode="numeric"
              min={0}
              max={720}
              step={1}
              className="max-w-32"
              value={handoffHours}
              onChange={(e) => setHandoffHours(e.target.value)}
              aria-invalid={handoffInvalid}
              aria-describedby={handoffInvalid ? "handoff-hours-error" : undefined}
            />
            {handoffInvalid ? (
              <p id="handoff-hours-error" className="text-xs text-destructive">
                {t.handoffInvalid}
              </p>
            ) : (
              handoffValue === 0 && (
                <p className="text-xs text-muted-foreground">{t.handoffNever}</p>
              )
            )}
          </div>
        </div>

        {error && !linkError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || loading || handoffInvalid}>
            {loading ? c.saving : t.save}
          </Button>
          <SavedMark show={saved} />
        </div>
      </CardContent>
    </Card>
  );
}

function Switch({
  id,
  checked,
  onChange,
  label,
  help,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
    >
      <input
        id={id}
        className="mt-0.5 size-4 accent-primary"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block font-medium">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-muted-foreground">{help}</span>}
      </span>
    </label>
  );
}
