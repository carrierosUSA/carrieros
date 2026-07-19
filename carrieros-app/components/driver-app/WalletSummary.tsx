"use client";

import Link from "next/link";
import { QrCode, Shield } from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { seedDocuments, seedIdentity } from "@/lib/wallet/seed";
import {
  DmCard,
  DmSectionLabel,
  StatusChip,
} from "@/components/driver-mobile/ui";

const FOCUS_CATEGORIES = new Set([
  "cdl",
  "medical",
  "insurance",
  "twic",
  "passport",
  "endorsement",
  "safety_training",
  "identity",
]);

export default function WalletSummary() {
  const { state } = useDriverApp();
  const docs = seedDocuments.filter((d) => FOCUS_CATEGORIES.has(d.category));
  const expiring = docs.filter((d) => d.status === "expiring" || d.status === "expired");

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Driver Wallet</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Career Passport, credentials, and expiration alerts.
        </p>
      </div>

      <DmCard className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-info)]/15 text-[18px] font-bold text-[var(--color-info)]">
            {seedIdentity.photoInitials}
          </div>
          <div>
            <p className="text-[17px] font-bold">{state.driverName}</p>
            <p className="text-[13px] text-[var(--dm-muted)]">{seedIdentity.headline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip label={`CDL ${state.cdl.class}`} tone="success" />
          <StatusChip label="Professional ID" tone="info" />
          <StatusChip label="QR ready" tone="muted" />
        </div>
      </DmCard>

      {expiring.length > 0 && (
        <>
          <DmSectionLabel>Expiration alerts</DmSectionLabel>
          <div className="space-y-2">
            {expiring.map((d) => (
              <DmCard key={d.id}>
                <p className="text-[15px] font-semibold">{d.title}</p>
                <p className="mt-1 text-[13px] text-[var(--color-warning)]">
                  {d.status === "expired" ? "Expired" : "Expiring soon"}
                  {d.expiresAt ? ` · ${d.expiresAt}` : ""}
                </p>
              </DmCard>
            ))}
          </div>
        </>
      )}

      <DmSectionLabel>Credentials</DmSectionLabel>
      <div className="space-y-2">
        <DmCard className="space-y-1">
          <p className="text-[15px] font-semibold">CDL</p>
          <p className="text-[14px] text-[var(--dm-muted)]">
            Class {state.cdl.class} · {state.cdl.state} · Exp {state.cdl.expiresAt}
          </p>
        </DmCard>
        <DmCard className="space-y-1">
          <p className="text-[15px] font-semibold">Medical card</p>
          <p className="text-[14px] text-[var(--dm-muted)]">
            {state.medical.cardNumber} · Exp {state.medical.expiresAt}
          </p>
        </DmCard>
        {docs.slice(0, 6).map((d) => (
          <DmCard key={d.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold">{d.title}</p>
              <p className="text-[13px] text-[var(--dm-muted)] capitalize">
                {d.category.replace(/_/g, " ")}
              </p>
            </div>
            <StatusChip
              label={d.status === "valid" ? "Valid" : d.status.replace(/_/g, " ")}
              tone={
                d.status === "valid"
                  ? "success"
                  : d.status === "expired"
                    ? "critical"
                    : "warning"
              }
            />
          </DmCard>
        ))}
      </div>

      <DmCard className="flex items-center gap-3">
        <QrCode className="h-8 w-8 text-[var(--color-info)]" />
        <div>
          <p className="text-[15px] font-semibold">Share Professional ID</p>
          <p className="text-[13px] text-[var(--dm-muted)]">
            QR / secure link via full Wallet
          </p>
        </div>
      </DmCard>

      <Link
        href="/wallet"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-info)] px-4 text-[16px] font-semibold text-white"
      >
        <Shield className="h-5 w-5" /> Open full Wallet
      </Link>
    </div>
  );
}
