"use client";

import { useRef } from "react";
import { RefreshCw } from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { SERVICE_CATEGORY_LABELS } from "@/lib/driver-app/constants";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
  formatMoney,
} from "@/components/driver-mobile/ui";

export default function ConnectedServices() {
  const { state, toggleConnection, syncFuelDemo, addFuelFromReceipt } = useDriverApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const fuelTxns = state.fuelTransactions;
  const totalGal = fuelTxns.reduce((n, t) => n + t.gallons, 0);

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Connected Services</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Connect providers for fuel, ELD, payroll, and more. Demo sync — not live APIs.
        </p>
      </div>

      <DmSectionLabel>Fuel</DmSectionLabel>
      <DmCard className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[12px] font-medium text-[var(--dm-muted)]">Avg MPG</p>
            <p className="text-[22px] font-bold">{state.mpgAverage}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[var(--dm-muted)]">Gallons (synced)</p>
            <p className="text-[22px] font-bold">{totalGal.toFixed(0)}</p>
          </div>
        </div>
        <DmPrimaryButton onClick={syncFuelDemo}>
          <RefreshCw className="h-5 w-5" /> Sync fuel providers (demo)
        </DmPrimaryButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addFuelFromReceipt(f.name);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
        >
          Photo receipt → AI extract
        </button>
      </DmCard>

      <DmSectionLabel>Fuel history</DmSectionLabel>
      <div className="space-y-2">
        {fuelTxns.map((t) => (
          <DmCard key={t.id} className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">{t.stationName}</p>
                <p className="text-[13px] text-[var(--dm-muted)]">
                  {t.stationCity}, {t.stationState} · {t.providerName}
                </p>
              </div>
              <p className="text-[16px] font-bold">{formatMoney(t.amount)}</p>
            </div>
            <p className="text-[13px] text-[var(--dm-muted)]">
              {t.gallons} gal
              {t.defGallons ? ` · ${t.defGallons} DEF` : ""} · ****{t.cardLast4} · {t.txnId}
            </p>
            {t.unusual && (
              <StatusChip label={t.unusualReason ?? "Unusual"} tone="warning" />
            )}
          </DmCard>
        ))}
      </div>

      <DmSectionLabel>All services</DmSectionLabel>
      <div className="space-y-2">
        {state.connections.map((c) => (
          <DmCard key={c.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">{c.name}</p>
              <p className="text-[13px] text-[var(--dm-muted)]">
                {SERVICE_CATEGORY_LABELS[c.category]} · {c.provider}
              </p>
              {c.lastSyncAt && (
                <p className="text-[12px] text-[var(--dm-muted)]">
                  Last sync {new Date(c.lastSyncAt).toLocaleString()}
                </p>
              )}
              {c.statusNote && (
                <p className="mt-0.5 text-[12px] text-[var(--color-info)]">{c.statusNote}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleConnection(c.id)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold ${
                c.connected
                  ? "bg-green-500/15 text-[var(--color-success)]"
                  : "bg-[var(--dm-elevated)]"
              }`}
            >
              {c.connected ? "Connected" : "Connect"}
            </button>
          </DmCard>
        ))}
      </div>
    </div>
  );
}
