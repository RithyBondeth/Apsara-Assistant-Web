"use client";

import { useEffect, useState } from "react";
import { Plug, Plus } from "lucide-react";
import AppHeader from "@/components/header";
import IntegrationCard from "@/components/integrations/integration-card";
import ConnectDialog from "@/components/integrations/connect-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntegrationsStore } from "@/stores/apis/integrations/integrations.store";
import { PLATFORM_COPY } from "@/utils/constants/integration.constant";
import {
  IIntegrationCreate,
  TIntegrationPlatform,
} from "@/utils/interfaces/integration/integration.interface";
import EmptyState from "@/components/shared/empty-state";

const PLATFORMS: TIntegrationPlatform[] = ["messenger", "telegram", "stripe"];

export default function IntegrationsPage() {
  // ── All States
  const [connecting, setConnecting] = useState<TIntegrationPlatform | null>(null);

  // ── API Integration
  const {
    integrations,
    loading,
    error,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    checkIntegration,
    registerWebhook,
    clearError,
  } = useIntegrationsStore();

  // ── Effects
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // ── Methods
  async function handleCreate(data: IIntegrationCreate) {
    return Boolean(await createIntegration(data));
  }

  async function handleDisconnect(
    id: string,
    label: string,
    platform: TIntegrationPlatform,
  ) {
    // Keyed on the platform, not the label — a seller who renamed their Stripe
    // connection would otherwise be warned about messages that never existed.
    const consequence =
      platform === "stripe"
        ? "You will not be able to send card payment links."
        : "Messages from it will stop arriving.";
    if (!confirm(`Disconnect ${label}? ${consequence}`)) return;
    await deleteIntegration(id);
  }

  function openConnect(platform: TIntegrationPlatform) {
    clearError();
    setConnecting(platform);
  }

  // ── Render UI
  return (
    <>
      <AppHeader
        title="Integrations"
        description="Connect the channels and payments that power your sales workflow"
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Available connections</p>
            <p className="text-xs text-muted-foreground">
              {integrations.length} connected
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <Button key={platform} size="sm" variant="outline"
                      onClick={() => openConnect(platform)}>
                <Plus className="mr-1.5 h-4 w-4" />
                {PLATFORM_COPY[platform].label}
              </Button>
            ))}
          </div>
        </div>

        {/* The dialog surfaces its own failures; this covers the rest. */}
        {error && !connecting && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && integrations.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : integrations.length === 0 ? (
          <EmptyState
            icon={Plug}
            title="Connect your first sales channel"
            description="Messenger and Telegram bring real customer messages into Chat. Stripe lets you send secure card payment links from an order."
          >
            <Button size="sm" onClick={() => openConnect("messenger")}>
              <Plus className="mr-1.5 size-4" />
              Connect Messenger
            </Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                busy={loading}
                onToggleAutoReply={(auto_reply) =>
                  updateIntegration(integration.id, { auto_reply })
                }
                onToggleActive={(is_active) =>
                  updateIntegration(integration.id, { is_active })
                }
                onCheck={() => checkIntegration(integration.id)}
                onRegisterWebhook={() => registerWebhook(integration.id)}
                onDisconnect={() =>
                  handleDisconnect(
                    integration.id,
                    integration.display_name ||
                      PLATFORM_COPY[integration.platform].label,
                    integration.platform,
                  )
                }
              />
            ))}
          </div>
        )}
      </main>

      <ConnectDialog
        open={connecting !== null}
        onOpenChange={(open) => setConnecting(open ? connecting : null)}
        platform={connecting ?? "messenger"}
        onCreate={handleCreate}
        error={error}
        onDismissError={clearError}
      />
    </>
  );
}
