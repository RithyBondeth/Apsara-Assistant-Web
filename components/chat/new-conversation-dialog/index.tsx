"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PLATFORMS, PLATFORM_BY_ID } from "@/utils/constants/platforms.constant";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { useT } from "@/hooks/utils/use-translations";
import { INewConversationDialogProps } from "./props";

export default function NewConversationDialog({
  open,
  onOpenChange,
  customers,
  onCreate,
}: INewConversationDialogProps) {
  // ── Translations
  const t = useT("chat");
  const tc = useT("common");

  // ── All States
  const [customerId, setCustomerId] = useState("");
  const [platform, setPlatform] = useState<PlatformId>("website");
  const [loading, setLoading] = useState(false);

  // ── Methods
  async function handleCreate() {
    if (!customerId) return;
    setLoading(true);
    await onCreate(customerId, platform);
    setLoading(false);
    onOpenChange(false);
    setCustomerId("");
    setPlatform("website");
  }

  // ── Render UI
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.newConversation}</DialogTitle>
          <DialogDescription>{t.newDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── Customer select */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-select">{t.customerLabel}</Label>
            {customers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noCustomers}</p>
            ) : (
              <select
                id="customer-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">{t.selectCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.platform
                      ? ` (${PLATFORM_BY_ID[c.platform]?.name ?? c.platform})`
                      : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ── Platform select */}
          <div className="space-y-1.5">
            <Label htmlFor="platform-select">{t.platformLabel}</Label>
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PlatformId)}
              className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc.cancel}
          </Button>
          <Button onClick={handleCreate} disabled={!customerId || loading}>
            {loading ? t.creating : t.start}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
