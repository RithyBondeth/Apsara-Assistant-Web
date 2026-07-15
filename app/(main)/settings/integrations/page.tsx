"use client";

import { useEffect, useMemo, useState } from "react";
import { LucideLink, LucideLoader2, LucidePlus, LucideTrash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConnectDialog from "@/components/integrations/connect-dialog";
import WebhookPanel from "@/components/integrations/webhook-panel";
import { useIntegrationsStore } from "@/stores/apis/integrations/integrations.store";
import { useT } from "@/hooks/utils/use-translations";
import { PLATFORMS, IPlatformMeta } from "@/utils/constants/platforms.constant";
import {
  IIntegration,
  IIntegrationCreate,
  PlatformId,
} from "@/utils/interfaces/integration/integration.interface";

const SETUP_LABEL: Record<IPlatformMeta["setup"], string> = {
  automatic: "One-click setup",
  manual: "Needs dashboard setup",
  none: "No setup needed",
};

export default function IntegrationsPage() {
  // ── Translations
  const t = useT("settings");

  // ── API Integration
  const {
    integrations,
    webhooks,
    loading,
    registering,
    error,
    fetchIntegrations,
    createIntegration,
    deleteIntegration,
    registerWebhook,
    clearError,
  } = useIntegrationsStore();

  // ── All States
  const [connecting, setConnecting] = useState<IPlatformMeta | null>(null);

  // ── Effects
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // ── Group the seller's connections under their platform. The API's unique
  // constraint is (platform, external_id), so more than one per platform is
  // legitimate — two Telegram bots, two Pages.
  const byPlatform = useMemo(() => {
    const map = {} as Record<PlatformId, IIntegration[]>;
    for (const integration of integrations) {
      (map[integration.platform] ??= []).push(integration);
    }
    return map;
  }, [integrations]);

  // ── Methods
  async function handleConnect(data: IIntegrationCreate) {
    const created = await createIntegration(data);
    if (!created) return; // keep the dialog open so the error stays visible

    setConnecting(null);
    // Telegram registers server-side, so do it immediately. The Meta platforms
    // and the website widget only need the URL, which this also returns.
    await registerWebhook(created.id);
  }

  async function handleDisconnect(integration: IIntegration, name: string) {
    if (!confirm(`Disconnect ${name}? Messages from this channel will stop reaching your assistant.`))
      return;
    await deleteIntegration(integration.id);
  }

  function openConnect(platform: IPlatformMeta) {
    clearError();
    setConnecting(platform);
  }

  // ── Render UI
  // The settings layout supplies the page header, width and padding.
  return (
    <>
      <p className="text-sm text-muted-foreground">{t.integrationsDesc}</p>

      {error && !connecting && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading && integrations.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {PLATFORMS.map((platform) => {
            const connected = byPlatform[platform.id] ?? [];
            return (
              <Card key={platform.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${platform.accent}`}
                    >
                      <platform.icon className="size-4.5" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold">{platform.name}</h2>
                        {connected.length > 0 && (
                          <Badge className="bg-green-100 text-[10px] text-green-700 dark:bg-green-950 dark:text-green-300">
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{platform.tagline}</p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {SETUP_LABEL[platform.setup]}
                      </p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => openConnect(platform)}>
                    <LucidePlus className="mr-1 size-3.5" />
                    {connected.length > 0 ? "Add another" : "Connect"}
                  </Button>
                </CardHeader>

                {connected.length > 0 && (
                  <CardContent className="space-y-3 pt-0">
                    {connected.map((integration) => (
                      <div key={integration.id} className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {integration.external_id
                                ? `ID ${integration.external_id}`
                                : platform.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {integration.is_active ? "Active" : "Paused"} · added{" "}
                              {new Date(integration.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={registering === integration.id}
                              onClick={() => registerWebhook(integration.id)}
                            >
                              {registering === integration.id ? (
                                <LucideLoader2 className="mr-1 size-3.5 animate-spin" />
                              ) : (
                                <LucideLink className="mr-1 size-3.5" />
                              )}
                              {platform.setup === "automatic" ? "Re-register" : "Get URL"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label={`Disconnect ${platform.name}`}
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDisconnect(integration, platform.name)}
                            >
                              <LucideTrash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {webhooks[integration.id] && (
                          <WebhookPanel result={webhooks[integration.id]} />
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConnectDialog
        platform={connecting}
        open={connecting !== null}
        onOpenChange={(open) => !open && setConnecting(null)}
        onConnect={handleConnect}
        loading={loading}
        error={error}
      />
    </>
  );
}
