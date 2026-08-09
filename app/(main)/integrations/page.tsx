"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AppHeader from "@/components/header";
import IntegrationCard from "@/components/integrations/integration-card";
import ConnectDialog from "@/components/integrations/connect-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntegrationsStore } from "@/stores/apis/integrations/integrations.store";
import { PLATFORM_COPY } from "@/utils/constants/integration.constant";
import {
  IIntegrationCreate,
  TIntegrationPlatform,
} from "@/utils/interfaces/integration/integration.interface";

const PLATFORMS: TIntegrationPlatform[] = ["messenger", "telegram"];

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

  async function handleDisconnect(id: string, label: string) {
    if (!confirm(`Disconnect ${label}? Messages from it will stop arriving.`)) return;
    await deleteIntegration(id);
  }

  function openConnect(platform: TIntegrationPlatform) {
    clearError();
    setConnecting(platform);
  }

  // ── Render UI
  return (
    <>
      <AppHeader title="Integrations" />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {PLATFORMS.map((platform) => (
            <Button key={platform} size="sm" variant="outline"
                    onClick={() => openConnect(platform)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Connect {PLATFORM_COPY[platform].label}
            </Button>
          ))}
        </div>

        {/* The dialog surfaces its own failures; this covers the rest. */}
        {error && !connecting && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && integrations.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : integrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No channels connected yet.
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Until you connect a Page or bot, the Chat screen is a rehearsal —
                you type as the customer and the assistant answers. Connecting one
                brings real conversations in.
              </p>
            </CardContent>
          </Card>
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
                onDisconnect={() =>
                  handleDisconnect(
                    integration.id,
                    integration.display_name ||
                      PLATFORM_COPY[integration.platform].label
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
