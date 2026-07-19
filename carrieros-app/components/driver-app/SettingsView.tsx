"use client";

import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { DmCard, DmSectionLabel } from "@/components/driver-mobile/ui";

export default function SettingsView() {
  const { state, darkMode, setDarkMode, updateSecurity, flash } = useDriverApp();
  const s = state.security;

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Settings</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Theme, biometrics, and secure storage — product-honest affordances.
        </p>
      </div>

      <DmSectionLabel>Appearance</DmSectionLabel>
      <DmCard>
        <ToggleRow
          label="Dark mode"
          detail="Calm night driving UI"
          on={darkMode}
          onToggle={() => setDarkMode(!darkMode)}
        />
      </DmCard>

      <DmSectionLabel>Security</DmSectionLabel>
      <DmCard className="space-y-1">
        <ToggleRow
          label="Face ID"
          detail="Unlock with Face ID when available on device"
          on={s.faceIdEnabled}
          onToggle={() => {
            updateSecurity({ faceIdEnabled: !s.faceIdEnabled });
            flash(
              !s.faceIdEnabled
                ? "Face ID enabled (device biometric when supported)"
                : "Face ID disabled",
            );
          }}
        />
        <ToggleRow
          label="Fingerprint"
          detail="Touch ID / fingerprint unlock"
          on={s.fingerprintEnabled}
          onToggle={() => updateSecurity({ fingerprintEnabled: !s.fingerprintEnabled })}
        />
        <ToggleRow
          label="PIN lock"
          detail={s.pinSet ? "PIN is set on this device" : "Set a local PIN (demo toggle)"}
          on={s.pinEnabled}
          onToggle={() =>
            updateSecurity({
              pinEnabled: !s.pinEnabled,
              pinSet: !s.pinEnabled ? true : s.pinSet,
            })
          }
        />
      </DmCard>

      <DmSectionLabel>Data protection</DmSectionLabel>
      <DmCard className="space-y-2">
        <p className="text-[15px] font-semibold">Encrypted at rest</p>
        <p className="text-[14px] leading-relaxed text-[var(--dm-muted)]">
          Sensitive credential copies are stored with platform secure storage messaging.
          This demo uses localStorage for offline queues — production will use OS keychain /
          encrypted IndexedDB. {s.encryptedAtRest ? "Policy: enabled." : "Policy: review."}
        </p>
      </DmCard>

      <DmCard>
        <p className="text-[13px] text-[var(--dm-muted)]">
          Transpo Driver App™ · {state.driverName} · {state.truckUnit}
        </p>
      </DmCard>
    </div>
  );
}

function ToggleRow({
  label,
  detail,
  on,
  onToggle,
}: {
  label: string;
  detail: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left"
    >
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        <span className="block text-[13px] text-[var(--dm-muted)]">{detail}</span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${
          on ? "bg-[var(--color-info)]" : "bg-[var(--dm-elevated)]"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
            on ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}
