"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  createEnterpriseRequest,
  respondEnterpriseRequest,
} from "@/lib/wallet/store";
import type { EnterpriseRequest } from "@/lib/wallet/types";
import { WALLET_DOCUMENT_CATEGORY_LABELS } from "@/lib/wallet/types";
import { Building2 } from "lucide-react";

const STATUS_TONE: Record<
  EnterpriseRequest["status"],
  keyof typeof TRANSPO_COLORS
> = {
  pending: "warning",
  approved: "success",
  denied: "critical",
  fulfilled: "info",
  expired: "disabled",
};

export default function EnterpriseClient({
  requests,
}: {
  requests: EnterpriseRequest[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          Company admin workflows
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Request documents, track approvals, monitor expirations, and assign required
          certs. Restricted categories need owner consent.
        </p>
        <button
          type="button"
          disabled={pending}
          className="transpo-btn-primary mt-4"
          onClick={() => {
            startTransition(() => {
              const req = createEnterpriseRequest({
                companyName: "Lone Star Alpha Carrier",
                requestedBy: "Compliance admin",
                documentCategories: ["cdl", "medical", "insurance"],
                message:
                  "Onboarding compliance pack — CDL, medical, and insurance certificate.",
                requiredCerts: ["Defensive driving"],
              });
              setMessage(
                req
                  ? "Demo request created and notification sent."
                  : "Blocked by privacy controls — enable enterprise requests in Security.",
              );
              router.refresh();
            });
          }}
        >
          Demo: request compliance pack
        </button>
        {message ? (
          <p className={`mt-2 text-[13px] ${TRANSPO_COLORS.info.text}`}>{message}</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Open & recent requests</h2>
        {requests.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No enterprise requests"
            description="When a company asks for documents, they appear here for one-click approve or deny."
          />
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const tone = STATUS_TONE[req.status];
              const colors = TRANSPO_COLORS[tone];
              return (
                <div key={req.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#111827]">
                        {req.companyName}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#6B7280]">
                        {req.requestedBy}
                        {req.dueAt ? ` · Due ${req.dueAt}` : ""}
                      </p>
                      <p className="mt-2 text-[14px] text-[#334155]">{req.message}</p>
                      <p className="mt-2 text-[13px] text-[#6B7280]">
                        Docs:{" "}
                        {req.documentCategories
                          .map((c) => WALLET_DOCUMENT_CATEGORY_LABELS[c])
                          .join(", ")}
                      </p>
                      {req.requiredCerts?.length ? (
                        <p className="mt-1 text-[13px] text-[#6B7280]">
                          Required certs: {req.requiredCerts.join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${colors.bg} ${colors.text}`}
                    >
                      {req.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {req.status === "pending" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        className="transpo-btn-primary"
                        onClick={() => {
                          startTransition(() => {
                            const result = respondEnterpriseRequest(req.id, "approved");
                            setMessage(
                              result
                                ? "Approved — audit logged."
                                : "Could not approve — missing consent for restricted documents.",
                            );
                            router.refresh();
                          });
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className="transpo-btn-secondary"
                        onClick={() => {
                          startTransition(() => {
                            respondEnterpriseRequest(req.id, "denied");
                            setMessage("Denied — audit logged.");
                            router.refresh();
                          });
                        }}
                      >
                        Deny
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[12px] bg-[#EFF6FF] p-4">
        <h3 className="text-[15px] font-semibold text-[#111827]">Compliance reports</h3>
        <p className="mt-2 text-[14px] text-[#334155]">
          Demo report: track onboarding completion, training assignment, and document
          expirations for admins who have been granted access — never silent auto-reject.
        </p>
        <ul className="mt-3 space-y-1 text-[14px] text-[#334155]">
          <li>Pending owner responses: {requests.filter((r) => r.status === "pending").length}</li>
          <li>Approved this period: {requests.filter((r) => r.status === "approved").length}</li>
          <li>Denied (consent / privacy): {requests.filter((r) => r.status === "denied").length}</li>
        </ul>
      </section>
    </div>
  );
}
