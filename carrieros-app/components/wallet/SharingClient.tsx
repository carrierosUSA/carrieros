"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { createShareLink, revokeShareLink } from "@/lib/wallet/store";
import type { ShareScope, WalletShareLink } from "@/lib/wallet/types";
import { SHARE_SCOPE_LABELS } from "@/lib/wallet/types";
import { Share2 } from "lucide-react";

const SCOPE_OPTIONS = Object.keys(SHARE_SCOPE_LABELS) as ShareScope[];

function linkStatus(link: WalletShareLink) {
  if (link.revokedAt) return { label: "Revoked", tone: "disabled" as const };
  if (new Date(link.expiresAt) <= new Date("2026-07-17T12:00:00.000Z")) {
    return { label: "Expired", tone: "critical" as const };
  }
  return { label: "Active", tone: "success" as const };
}

export default function SharingClient({ links }: { links: WalletShareLink[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("Hiring packet");
  const [scopes, setScopes] = useState<ShareScope[]>(["cdl_only", "medical", "read_only"]);
  const [days, setDays] = useState(14);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  function toggleScope(scope: ShareScope) {
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((s) => s !== scope)
        : [...current, scope],
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
        <h2 className="text-[15px] font-semibold text-[#111827]">Create secure share link</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Choose scopes, set an expiration, revoke anytime. Access is controlled and audit
          logged. Documents are encrypted at rest.
        </p>

        <label className="mt-4 block">
          <span className="text-[13px] font-medium text-[#6B7280]">Label</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 h-10 w-full max-w-md rounded-[12px] bg-white px-3 text-[14px] outline-none ring-1 ring-[#E5E7EB] focus:ring-[#93C5FD]"
          />
        </label>

        <div className="mt-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Scopes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SCOPE_OPTIONS.map((scope) => {
              const active = scopes.includes(scope);
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() => toggleScope(scope)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                    active
                      ? "bg-[#2563EB] text-white"
                      : "bg-white text-[#6B7280] ring-1 ring-[#E5E7EB]"
                  }`}
                >
                  {SHARE_SCOPE_LABELS[scope]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-4 block max-w-[200px]">
          <span className="text-[13px] font-medium text-[#6B7280]">Expires in (days)</span>
          <input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 7)}
            className="mt-1 h-10 w-full rounded-[12px] bg-white px-3 text-[14px] outline-none ring-1 ring-[#E5E7EB] focus:ring-[#93C5FD]"
          />
        </label>

        <button
          type="button"
          disabled={pending || scopes.length === 0 || !label.trim()}
          className="transpo-btn-primary mt-4"
          onClick={() => {
            startTransition(() => {
              const link = createShareLink({
                label: label.trim(),
                scopes,
                expiresInDays: days,
              });
              setCreatedToken(link.token);
              router.refresh();
            });
          }}
        >
          Generate link
        </button>

        {createdToken ? (
          <p className={`mt-3 text-[14px] ${TRANSPO_COLORS.success.text}`}>
            Link ready:{" "}
            <Link href={`/wallet/share/${createdToken}`} className="font-semibold underline">
              /wallet/share/{createdToken}
            </Link>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Your share links</h2>
        {links.length === 0 ? (
          <EmptyState
            icon={Share2}
            title="No share links yet"
            description="Create a scoped, expiring link for hiring or compliance."
          />
        ) : (
          <div className="space-y-2">
            {links.map((link) => {
              const status = linkStatus(link);
              const colors = TRANSPO_COLORS[status.tone];
              return (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">{link.label}</p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">
                      {link.scopes.map((s) => SHARE_SCOPE_LABELS[s]).join(" · ")} ·{" "}
                      {link.viewCount} views · expires{" "}
                      {new Date(link.expiresAt).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/wallet/share/${link.token}`}
                      className="mt-1 inline-flex text-[13px] font-medium text-[#2563EB]"
                    >
                      Open shared view
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${colors.bg} ${colors.text}`}
                    >
                      {status.label}
                    </span>
                    {!link.revokedAt && status.label === "Active" ? (
                      <button
                        type="button"
                        disabled={pending}
                        className="transpo-btn-secondary"
                        onClick={() => {
                          startTransition(() => {
                            revokeShareLink(link.id);
                            router.refresh();
                          });
                        }}
                      >
                        Revoke
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
