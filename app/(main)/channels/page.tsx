"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LucideLink,
  LucideLoader2,
  LucidePause,
  LucidePencil,
  LucidePlay,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AppHeader from "@/components/header";
import ConnectDialog from "@/components/integrations/connect-dialog";
import WebhookPanel from "@/components/integrations/webhook-panel";
import { useIntegrationsStore } from "@/stores/apis/integrations/integrations.store";
import { useT } from "@/hooks/utils/use-translations";
import {
  PLATFORMS,
  PLATFORM_BY_ID,
  IPlatformMeta,
  platformCopy,
} from "@/utils/constants/platforms.constant";
import {
  IIntegration,
  IIntegrationCreate,
  IIntegrationUpdate,
  PlatformId,
} from "@/utils/interfaces/integration/integration.interface";

export default function ChannelsPage() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("channels");

  const setupLabel: Record<IPlatformMeta["setup"], string> = {
    automatic: t.setupAutomatic,
    manual: t.setupManual,
    none: t.setupNone,
  };

  // ── API Integration ────────────────────────────────────────────────────────
  const {
    integrations,
    webhooks,
    loading,
    registering,
    error,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    registerWebhook,
    clearError,
  } = useIntegrationsStore();

  // ── All States ─────────────────────────────────────────────────────────────
  const [connecting, setConnecting] = useState<IPlatformMeta | null>(null);
  // Set alongside `connecting` to put the same dialog into edit mode.
  const [editing, setEditing] = useState<IIntegration | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // ── Group the seller's connections under their platform. The API's unique ──
  // constraint is (platform, external_id), so more than one per platform is
  // legitimate — two Telegram bots, two Pages.
  const byPlatform = useMemo(() => {
    const map = {} as Record<PlatformId, IIntegration[]>;
    for (const integration of integrations) {
      (map[integration.platform] ??= []).push(integration);
    }
    return map;
  }, [integrations]);

  // ── Methods ────────────────────────────────────────────────────────────────
  async function handleConnect(data: IIntegrationCreate) {
    const created = await createIntegration(data);
    if (!created) return; // keep the dialog open so the error stays visible

    closeDialog();
    // Telegram registers server-side, so do it immediately. The Meta platforms
    // and the website widget only need the URL, which this also returns.
    await registerWebhook(created.id);
  }

  async function handleUpdate(id: string, data: IIntegrationUpdate) {
    const updated = await updateIntegration(id, data);
    if (!updated) return; // keep the dialog open so the error stays visible

    closeDialog();
    // A rotated token has to be re-registered with the platform or the webhook
    // still points at the dead one — Telegram does that server-side for us.
    if (data.access_token && PLATFORM_BY_ID[updated.platform].setup === "automatic") {
      await registerWebhook(updated.id);
    }
  }

  /**
   * Pausing leaves the credentials in place, so the seller can stop a noisy or
   * misbehaving bot without tearing down the connection — deleting it would
   * orphan `integration_id` on every conversation that arrived through it.
   */
  async function handleTogglePause(integration: IIntegration) {
    setToggling(integration.id);
    await updateIntegration(integration.id, { is_active: !integration.is_active });
    setToggling(null);
  }

  async function handleDisconnect(integration: IIntegration, name: string) {
    if (!confirm(t.disconnectConfirm.replace("{name}", name))) return;
    await deleteIntegration(integration.id);
  }

  function openConnect(platform: IPlatformMeta) {
    clearError();
    setEditing(null);
    setConnecting(platform);
  }

  function openEdit(platform: IPlatformMeta, integration: IIntegration) {
    clearError();
    setEditing(integration);
    setConnecting(platform);
  }

  function closeDialog() {
    setConnecting(null);
    setEditing(null);
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex-1 p-6 lg:p-8">
        {/* No max-width: a fixed cap re-opens a dead gutter on wide screens
            (560px at 2000px). The 2-up grid absorbs the width instead, and
            stays balanced at exactly four channels. */}
        <div className="w-full">
          <p className="mb-5 text-sm text-muted-foreground">{t.subtitle}</p>

          {error && !connecting && (
            <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* A single stacked column can't fill a wide page — four channels in a
              2-up grid uses the width instead of leaving a dead gutter. */}
          {loading && integrations.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[132px] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-2">
              {PLATFORMS.map((platform) => {
                const connected = byPlatform[platform.id] ?? [];
                const copy = platformCopy(t.platforms, platform.id);

                return (
                  <div
                    key={platform.id}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-border/80"
                  >
                    {/* ── Platform identity */}
                    <div className="flex items-start gap-3 p-4">
                      {/* Brand marks carry their own tile, so no wrapper. */}
                      <platform.icon className="size-10 shrink-0 rounded-lg" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-sm font-semibold">
                            {platform.name}
                          </h2>
                          {connected.length > 0 && (
                            <Badge className="shrink-0 bg-green-100 text-[10px] text-green-700 dark:bg-green-950 dark:text-green-300">
                              {t.connected}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {copy.tagline}
                        </p>
                      </div>
                    </div>

                    {/* ── Setup hint + action */}
                    <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-2.5">
                      <span className="truncate text-[11px] text-muted-foreground">
                        {setupLabel[platform.setup]}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => openConnect(platform)}
                      >
                        <LucidePlus className="mr-1 size-3.5" />
                        {connected.length > 0 ? t.addAnother : t.connect}
                      </Button>
                    </div>

                    {/* ── Connected accounts */}
                    {connected.length > 0 && (
                      <div className="space-y-2 border-t border-border bg-muted/30 p-3">
                        {connected.map((integration) => (
                          <div
                            key={integration.id}
                            className="space-y-2 rounded-lg border border-border bg-card p-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium">
                                  {integration.external_id
                                    ? `ID ${integration.external_id}`
                                    : platform.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {integration.is_active ? t.active : t.paused} ·{" "}
                                  {t.addedOn}{" "}
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
                                  {platform.setup === "automatic"
                                    ? t.reRegister
                                    : t.getUrl}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  aria-label={`${t.edit} ${platform.name}`}
                                  onClick={() => openEdit(platform, integration)}
                                >
                                  <LucidePencil className="size-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={toggling === integration.id}
                                  aria-label={`${
                                    integration.is_active ? t.pause : t.resume
                                  } ${platform.name}`}
                                  onClick={() => handleTogglePause(integration)}
                                >
                                  {toggling === integration.id ? (
                                    <LucideLoader2 className="size-3.5 animate-spin" />
                                  ) : integration.is_active ? (
                                    <LucidePause className="size-3.5" />
                                  ) : (
                                    <LucidePlay className="size-3.5" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  aria-label={`${t.disconnect} ${platform.name}`}
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleDisconnect(integration, platform.name)
                                  }
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ConnectDialog
        platform={connecting}
        integration={editing}
        open={connecting !== null}
        onOpenChange={(open) => !open && closeDialog()}
        onConnect={handleConnect}
        onUpdate={handleUpdate}
        loading={loading}
        error={error}
      />
    </>
  );
}
