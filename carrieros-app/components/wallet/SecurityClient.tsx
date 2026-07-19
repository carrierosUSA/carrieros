"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  revokeAllShareLinks,
  updateConsent,
  updatePrivacyControls,
} from "@/lib/wallet/store";
import type { ConsentFlag, WalletPrivacyControls } from "@/lib/wallet/types";
import { CONSENT_FLAG_LABELS } from "@/lib/wallet/types";

export default function SecurityClient({
  privacy,
}: {
  privacy: WalletPrivacyControls;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(privacy);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
        <h2 className="text-[15px] font-semibold text-[#111827]">How your data is protected</h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-[#334155]">
          <li>Encrypted at rest in platform storage</li>
          <li>Access controlled by scopes, consent, and RBAC</li>
          <li>Sensitive actions are audit logged</li>
          <li>
            We do not claim end-to-end encryption for share links — viewers see only
            authorized scopes before expiry or revocation
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Authentication</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/settings" className="transpo-btn-primary">
            Open Settings (MFA / account)
          </Link>
          <button
            type="button"
            disabled={pending}
            className="transpo-btn-secondary"
            title={
              local.biometricPreferred
                ? "Biometric preference on — uses device capabilities when available"
                : "Prefer biometric unlock when the device supports it"
            }
            onClick={() => {
              startTransition(() => {
                const next = !local.biometricPreferred;
                const updated = updatePrivacyControls({ biometricPreferred: next });
                setLocal(updated);
                setMsg(
                  next
                    ? "Biometric preference enabled (progressive enhancement)."
                    : "Biometric preference turned off.",
                );
                router.refresh();
              });
            }}
          >
            {local.biometricPreferred ? "Biometric preferred · On" : "Enable biometric preference"}
          </button>
        </div>
        <p className="text-[13px] text-[#6B7280]">
          MFA status (demo): {local.mfaEnabled ? "Enabled" : "Not enabled"} — manage in
          Settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">RBAC summary</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["Wallet owner", "Full control, consent, revoke"],
            ["Share recipient", "Read-only scoped view until expiry"],
            ["Company admin", "Request docs; cannot bypass consent"],
            ["Platform admin", "Audit support — no silent document export"],
          ].map(([role, access]) => (
            <div key={role} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">{role}</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{access}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Privacy consents</h2>
        <div className="space-y-2">
          {(Object.keys(CONSENT_FLAG_LABELS) as ConsentFlag[]).map((flag) => (
            <label
              key={flag}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <span className="text-[14px] text-[#111827]">{CONSENT_FLAG_LABELS[flag]}</span>
              <input
                type="checkbox"
                checked={local.consents[flag]}
                disabled={pending}
                onChange={(e) => {
                  const value = e.target.checked;
                  startTransition(() => {
                    const updated = updateConsent(flag, value);
                    setLocal(updated);
                    router.refresh();
                  });
                }}
                className="h-4 w-4 accent-[#2563EB]"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Sharing controls</h2>
        <label className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3">
          <span className="text-[14px] text-[#111827]">Show Trust Score on share links</span>
          <input
            type="checkbox"
            checked={local.showTrustScorePublicly}
            disabled={pending}
            onChange={(e) => {
              startTransition(() => {
                const updated = updatePrivacyControls({
                  showTrustScorePublicly: e.target.checked,
                });
                setLocal(updated);
                router.refresh();
              });
            }}
            className="h-4 w-4 accent-[#2563EB]"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3">
          <span className="text-[14px] text-[#111827]">Allow enterprise document requests</span>
          <input
            type="checkbox"
            checked={local.allowEnterpriseRequests}
            disabled={pending}
            onChange={(e) => {
              startTransition(() => {
                const updated = updatePrivacyControls({
                  allowEnterpriseRequests: e.target.checked,
                });
                setLocal(updated);
                router.refresh();
              });
            }}
            className="h-4 w-4 accent-[#2563EB]"
          />
        </label>
        <button
          type="button"
          disabled={pending}
          className="transpo-btn-secondary"
          onClick={() => {
            startTransition(() => {
              const count = revokeAllShareLinks();
              setMsg(`Revoked ${count} active share link(s).`);
              router.refresh();
            });
          }}
        >
          Revoke all share links
        </button>
      </section>

      {msg ? (
        <p className={`text-[14px] ${TRANSPO_COLORS.success.text}`}>{msg}</p>
      ) : null}

      <Link href="/wallet/audit" className="inline-flex text-[13px] font-medium text-[#2563EB]">
        View audit trail
      </Link>
    </div>
  );
}
