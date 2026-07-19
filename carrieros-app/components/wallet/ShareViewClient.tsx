import EmptyState from "@/components/ui/EmptyState";
import WalletStatusBadge from "@/components/wallet/WalletStatusBadge";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { SharedWalletView } from "@/lib/wallet/store";
import { SHARE_SCOPE_LABELS, WALLET_DOCUMENT_CATEGORY_LABELS } from "@/lib/wallet/types";
import { ShieldOff } from "lucide-react";

export default function ShareViewClient({ view }: { view: SharedWalletView }) {
  if (!view.ok) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={
          view.reason === "revoked"
            ? "Link revoked"
            : view.reason === "expired"
              ? "Link expired"
              : "Link not found"
        }
        description={view.message}
        actionLabel="Go to Wallet"
        actionHref="/wallet"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#F8F9FB] p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Shared Career Passport view
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[14px] font-bold text-[#2563EB]">
            {view.identity.photoInitials}
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#111827]">
              {view.identity.fullName}
            </h2>
            <p className="text-[14px] text-[#6B7280]">{view.identity.headline}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-[#6B7280]">
          Scopes: {view.share.scopes.map((s) => SHARE_SCOPE_LABELS[s]).join(" · ")} ·
          Read-only · Expires {new Date(view.share.expiresAt).toLocaleString()}
        </p>
        {view.trustScore != null ? (
          <p className={`mt-2 text-[14px] font-semibold ${TRANSPO_COLORS.info.text}`}>
            Trust Score {view.trustScore}{" "}
            <span className="font-medium text-[#6B7280]">
              · decision-support only, never auto-reject
            </span>
          </p>
        ) : null}
      </section>

      <section className="space-y-2">
        <h3 className="text-[15px] font-semibold text-[#111827]">Shared documents</h3>
        {view.documents.length === 0 ? (
          <p className="text-[14px] text-[#6B7280]">
            No documents visible under current scopes and consent settings.
          </p>
        ) : (
          view.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{doc.title}</p>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {WALLET_DOCUMENT_CATEGORY_LABELS[doc.category]}
                  {doc.expiresAt ? ` · Expires ${doc.expiresAt}` : ""}
                </p>
              </div>
              <WalletStatusBadge status={doc.status} />
            </div>
          ))
        )}
      </section>

      <p className="text-[13px] leading-relaxed text-[#6B7280]">
        Access controlled · audit logged · encrypted at rest. Sensitive categories appear
        only when the owner granted consent.
      </p>
    </div>
  );
}
