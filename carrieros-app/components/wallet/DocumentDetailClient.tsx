"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import WalletStatusBadge from "@/components/wallet/WalletStatusBadge";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { extractFromDocument } from "@/lib/wallet/ai-helpers";
import { replaceDocument } from "@/lib/wallet/store";
import type { WalletDocument } from "@/lib/wallet/types";
import {
  ENDORSEMENT_LABELS,
  WALLET_DOCUMENT_CATEGORY_LABELS,
} from "@/lib/wallet/types";

export default function DocumentDetailClient({ document }: { document: WalletDocument }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const extracted = document.fileName
    ? extractFromDocument(document.fileName, document.category)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#6B7280]">
            {WALLET_DOCUMENT_CATEGORY_LABELS[document.category]}
          </p>
          <h2 className="mt-1 text-[22px] font-bold text-[#111827]">{document.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <WalletStatusBadge status={document.status} />
            {document.verified ? (
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
              >
                Verified
              </span>
            ) : null}
            <span className="rounded-full bg-[#F8F9FB] px-2.5 py-1 text-[12px] font-medium text-[#6B7280]">
              {document.sensitivity} sensitivity
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/wallet/sharing" className="transpo-btn-primary">
            Share securely
          </Link>
          <Link href="/wallet/ai" className="transpo-btn-secondary">
            Ask Alph
          </Link>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-[#334155]">{document.summary}</p>

      <dl className="grid gap-3 sm:grid-cols-2">
        {[
          ["Issuer", document.issuer],
          ["Issued", document.issuedAt],
          ["Expires", document.expiresAt],
          ["Number", document.numberMasked],
          [
            "Endorsement",
            document.endorsement ? ENDORSEMENT_LABELS[document.endorsement] : undefined,
          ],
          ["File", document.fileName],
          [
            "Consent",
            document.requiresConsent
              ? document.consentGranted
                ? "Granted"
                : "Not granted — required before share"
              : "Not required",
          ],
        ]
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label as string} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <dt className="text-[13px] font-medium text-[#6B7280]">{label}</dt>
              <dd className="mt-1 text-[14px] font-semibold text-[#111827]">{value}</dd>
            </div>
          ))}
      </dl>

      {extracted ? (
        <section className="rounded-[12px] bg-[#EFF6FF] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Alph extract (demo)</h3>
          <dl className="mt-3 space-y-2">
            {Object.entries(extracted).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 text-[14px]">
                <dt className="text-[#6B7280]">{k}</dt>
                <dd className="text-right font-medium text-[#111827]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {document.category === "medical" || document.status === "expiring" ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending}
            className="transpo-btn-primary"
            onClick={() => {
              startTransition(() => {
                replaceDocument(document.id, {
                  status: "pending_review",
                  summary: `${document.summary} Replacement uploaded for review.`,
                  fileName: `replacement-${document.fileName ?? "document.pdf"}`,
                });
                setMessage("Replacement marked pending review. Audit logged.");
                router.refresh();
              });
            }}
          >
            Upload replacement
          </button>
          {message ? (
            <p className={`text-[13px] ${TRANSPO_COLORS.success.text}`}>{message}</p>
          ) : null}
        </div>
      ) : null}

      {(document.category === "violation_history" ||
        document.category === "drug_test" ||
        document.category === "background_mvr") && (
        <p className={`rounded-[12px] px-4 py-3 text-[13px] leading-relaxed ${TRANSPO_COLORS.warning.bg} ${TRANSPO_COLORS.warning.text}`}>
          Sensitive record. Share only with proper authorization and explicit consent.
          Trust Score never auto-rejects based on this data.
        </p>
      )}
    </div>
  );
}
