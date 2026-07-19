"use client";

import IntegrationCard from "@/components/settings/IntegrationCard";
import { SettingsPanelFrame } from "@/components/settings/SettingsField";
import { SETTINGS_INTEGRATIONS } from "@/lib/settings/integrations-catalog";
import type {
  CarrierSettingsState,
  IntegrationConnection,
} from "@/lib/settings/types";

type IntegrationsPanelProps = {
  settings: CarrierSettingsState;
  onChange: (integrations: IntegrationConnection[]) => void;
  onPersist: (integrations: IntegrationConnection[], details: string) => void;
};

export default function IntegrationsPanel({
  settings,
  onChange,
  onPersist,
}: IntegrationsPanelProps) {
  function connectionFor(id: IntegrationConnection["providerId"]) {
    return (
      settings.integrations.find((i) => i.providerId === id) ?? {
        providerId: id,
        status: "disconnected" as const,
      }
    );
  }

  function connect(id: IntegrationConnection["providerId"], name: string) {
    const next = settings.integrations.map((i) =>
      i.providerId === id
        ? {
            ...i,
            status: "connected" as const,
            connectedAt: new Date().toISOString(),
            lastSyncAt: new Date().toISOString(),
            note: undefined,
          }
        : i,
    );
    // ensure provider exists in list
    const has = next.some((i) => i.providerId === id);
    const final = has
      ? next
      : [
          ...next,
          {
            providerId: id,
            status: "connected" as const,
            connectedAt: new Date().toISOString(),
            lastSyncAt: new Date().toISOString(),
          },
        ];
    onChange(final);
    onPersist(final, `Connected ${name}`);
  }

  function disconnect(id: IntegrationConnection["providerId"], name: string) {
    const next = settings.integrations.map((i) =>
      i.providerId === id
        ? {
            providerId: id,
            status: "disconnected" as const,
          }
        : i,
    );
    onChange(next);
    onPersist(next, `Disconnected ${name}`);
  }

  return (
    <SettingsPanelFrame
      title="Integrations"
      description="Connect accounting, payments, telematics, SMS, and FMCSA. Stubs reuse finance, compliance, and maintenance catalogs."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_INTEGRATIONS.map((meta) => {
          const connection = connectionFor(meta.id);
          return (
            <IntegrationCard
              key={meta.id}
              meta={meta}
              connection={connection}
              onConnect={() => connect(meta.id, meta.name)}
              onDisconnect={() => disconnect(meta.id, meta.name)}
            />
          );
        })}
      </div>
    </SettingsPanelFrame>
  );
}
