"use client";

import { useState } from "react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import PayrollView from "@/components/driver-mobile/PayrollView";
import {
  DmCard,
  DmSectionLabel,
  StatusChip,
} from "@/components/driver-mobile/ui";

export default function ProfileView() {
  const { state, darkMode, setDarkMode } = useDriverMobile();
  const [showPayroll, setShowPayroll] = useState(false);

  if (showPayroll) {
    return <PayrollView onBack={() => setShowPayroll(false)} />;
  }

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <DmCard>
        <div className="flex items-center gap-4">
          {state.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.photoUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--dm-elevated)] text-[20px] font-bold">
              {state.driverName.slice(0, 1)}
            </div>
          )}
          <div>
            <h2 className="text-[20px] font-bold tracking-tight">{state.driverName}</h2>
            <p className="text-[14px] text-[var(--dm-muted)]">{state.truckUnit}</p>
            <p className="text-[14px] text-[var(--dm-muted)]">{state.phone}</p>
          </div>
        </div>
      </DmCard>

      <button
        type="button"
        onClick={() => setShowPayroll(true)}
        className="flex min-h-14 w-full items-center justify-between rounded-[18px] bg-[var(--dm-surface)] px-4 text-left"
      >
        <span>
          <span className="block text-[15px] font-semibold">Payroll & settlements</span>
          <span className="text-[13px] text-[var(--dm-muted)]">CPM, bonus, detention…</span>
        </span>
        <span className="text-[var(--color-info)] text-[14px] font-semibold">Open</span>
      </button>

      <DmSectionLabel>CDL</DmSectionLabel>
      <DmCard className="space-y-2">
        <Row label="Class" value={state.cdl.class} />
        <Row label="Number" value={state.cdl.number} />
        <Row label="State" value={state.cdl.state} />
        <Row label="Expires" value={state.cdl.expiresAt} />
      </DmCard>

      <DmSectionLabel>Medical</DmSectionLabel>
      <DmCard className="space-y-2">
        <Row label="Card" value={state.medical.cardNumber} />
        <Row label="Expires" value={state.medical.expiresAt} />
      </DmCard>

      <DmSectionLabel>Training</DmSectionLabel>
      <DmCard>
        <ul className="space-y-2">
          {state.training.map((t) => (
            <li key={t} className="text-[15px] font-medium">
              {t}
            </li>
          ))}
        </ul>
      </DmCard>

      <DmSectionLabel>Documents</DmSectionLabel>
      <div className="space-y-2">
        {state.profileDocs.map((doc) => (
          <div
            key={doc.name}
            className="flex items-center justify-between rounded-[18px] bg-[var(--dm-surface)] px-4 py-3.5"
          >
            <div>
              <p className="text-[15px] font-semibold">{doc.name}</p>
              {doc.expiresAt && (
                <p className="text-[13px] text-[var(--dm-muted)]">Exp {doc.expiresAt}</p>
              )}
            </div>
            <StatusChip
              label={doc.status}
              tone={doc.status === "valid" ? "success" : "warning"}
            />
          </div>
        ))}
      </div>

      <DmCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold">Dark mode</p>
            <p className="text-[13px] text-[var(--dm-muted)]">Also follows system preference</p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`relative h-8 w-14 rounded-full transition ${
              darkMode ? "bg-[var(--color-info)]" : "bg-[var(--dm-elevated)]"
            }`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                darkMode ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </DmCard>

      {state.offlineQueue.length > 0 && (
        <>
          <DmSectionLabel>Queued offline</DmSectionLabel>
          <div className="space-y-2">
            {state.offlineQueue.map((q) => (
              <div
                key={q.id}
                className="rounded-[18px] bg-[var(--dm-surface)] px-4 py-3 text-[14px]"
              >
                <p className="font-semibold">{q.label}</p>
                <p className="text-[var(--dm-muted)] capitalize">{q.status}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[14px]">
      <span className="font-medium text-[var(--dm-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
