"use client";

import { useState } from "react";
import { Check, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SettingsSwitch from "@/components/settings/settings-switch";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useAppT } from "@/hooks/utils/use-app-translations";
import { IUser, IUserUpdate } from "@/utils/interfaces/auth/auth.interface";

// Bank apps render the payee name and city from Latin text only.
const LATIN = /^[\x20-\x7E]*$/;

export default function KhqrSettings({ user }: { user: IUser }) {
  const t = useAppT("settings").khqr;
  const c = useAppT("common");
  const { loading, error, updateProfile, clearError } = useAuthStore();

  const [enabled, setEnabled] = useState(user.khqr_enabled ?? false);
  const [accountId, setAccountId] = useState(user.bakong_account_id ?? "");
  const [merchantName, setMerchantName] = useState(
    user.khqr_merchant_name ?? (LATIN.test(user.business_name ?? "") ? user.business_name ?? "" : ""),
  );
  const [city, setCity] = useState(user.khqr_merchant_city ?? "Phnom Penh");
  const [merchantId, setMerchantId] = useState(user.khqr_merchant_id ?? "");
  const [bank, setBank] = useState(user.khqr_acquiring_bank ?? "");
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  const account = accountId.trim();
  const accountInvalid = account.length > 0 && !/^[^@\s]+@[^@\s]+$/.test(account);
  const nameInvalid = !LATIN.test(merchantName);
  const cityInvalid = !LATIN.test(city);
  // Turning KHQR on needs somewhere for the money to go.
  const missingAccount = enabled && account.length === 0;
  const invalid = accountInvalid || nameInvalid || cityInvalid || missingAccount;

  async function save(extra: IUserUpdate = {}) {
    clearError();
    setSaved(false);
    const payload: IUserUpdate = {
      khqr_enabled: enabled,
      bakong_account_id: account || null,
      khqr_merchant_name: merchantName.trim() || null,
      khqr_merchant_city: city.trim() || null,
      khqr_merchant_id: merchantId.trim() || null,
      khqr_acquiring_bank: bank.trim() || null,
      ...(token.trim() ? { bakong_api_token: token.trim() } : {}),
      ...extra,
    };
    if (await updateProfile(payload)) {
      setToken("");
      setSaved(true);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsSwitch
          id="khqr-enabled"
          checked={enabled}
          onChange={setEnabled}
          label={t.enabled}
          help={t.enabledHelp}
        />

        <div className="space-y-1.5">
          <Label htmlFor="khqr-account">{t.accountId}</Label>
          <Input
            id="khqr-account"
            value={accountId}
            placeholder={t.accountIdPlaceholder}
            onChange={(e) => setAccountId(e.target.value)}
            aria-invalid={accountInvalid || missingAccount}
          />
          <p className={accountInvalid || missingAccount ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {accountInvalid || missingAccount ? t.invalidAccount : t.accountIdHelp}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="khqr-name">{t.merchantName}</Label>
            <Input id="khqr-name" value={merchantName} maxLength={25}
                   onChange={(e) => setMerchantName(e.target.value)} aria-invalid={nameInvalid} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="khqr-city">{t.merchantCity}</Label>
            <Input id="khqr-city" value={city} maxLength={15}
                   onChange={(e) => setCity(e.target.value)} aria-invalid={cityInvalid} />
          </div>
        </div>
        <p className={nameInvalid || cityInvalid ? "-mt-2 text-xs text-destructive" : "-mt-2 text-xs text-muted-foreground"}>
          {t.latinOnly}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="khqr-merchant-id">{t.merchantId}</Label>
            <Input id="khqr-merchant-id" value={merchantId} maxLength={32}
                   onChange={(e) => setMerchantId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="khqr-bank">{t.acquiringBank}</Label>
            <Input id="khqr-bank" value={bank} maxLength={32}
                   onChange={(e) => setBank(e.target.value)} />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">{t.merchantHelp}</p>

        <div className="space-y-1.5">
          <Label htmlFor="khqr-token" className="flex items-center gap-1.5">
            <KeyRound className="size-3.5" /> {t.token}
          </Label>
          <Input
            id="khqr-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {user.bakong_token_set ? t.tokenSet : t.tokenMissing}
            </p>
            {user.bakong_token_set && (
              <Button size="xs" variant="ghost" disabled={loading}
                      onClick={() => save({ bakong_api_token: "" })}>
                {t.tokenClear}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={() => save()} disabled={loading || invalid}>
            {loading ? c.saving : t.save}
          </Button>
          {saved && (
            <span role="status" className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              {c.saved}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
