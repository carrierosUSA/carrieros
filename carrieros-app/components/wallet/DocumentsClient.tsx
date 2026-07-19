"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import WalletStatusBadge from "@/components/wallet/WalletStatusBadge";
import type { WalletDocument, WalletDocumentStatus } from "@/lib/wallet/types";
import { WALLET_DOCUMENT_CATEGORY_LABELS } from "@/lib/wallet/types";

const FILTERS: { id: "all" | WalletDocumentStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "valid", label: "Valid" },
  { id: "expiring", label: "Expiring" },
  { id: "expired", label: "Expired" },
  { id: "pending_review", label: "Pending" },
  { id: "revoked", label: "Revoked" },
];

export default function DocumentsClient({ documents }: { documents: WalletDocument[] }) {
  const [filter, setFilter] = useState<"all" | WalletDocumentStatus>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (filter !== "all" && d.status !== filter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        WALLET_DOCUMENT_CATEGORY_LABELS[d.category].toLowerCase().includes(q) ||
        (d.issuer ?? "").toLowerCase().includes(q)
      );
    });
  }, [documents, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents"
          className="h-10 w-full max-w-md rounded-[12px] bg-[#F8F9FB] px-4 text-[14px] text-[#111827] outline-none ring-1 ring-transparent placeholder:text-[#94A3B8] focus:bg-white focus:ring-[#93C5FD]"
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                filter === f.id
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F8F9FB] text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents match"
          description="Try another filter or clear your search."
          actionLabel="Clear filters"
          onAction={() => {
            setFilter("all");
            setQuery("");
          }}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Link
              key={doc.id}
              href={`/wallet/documents/${doc.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3 transition hover:bg-[#EFF6FF]"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#111827]">
                  {doc.title}
                </p>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {WALLET_DOCUMENT_CATEGORY_LABELS[doc.category]}
                  {doc.expiresAt ? ` · Expires ${doc.expiresAt}` : ""}
                  {doc.requiresConsent && !doc.consentGranted
                    ? " · Consent required to share"
                    : ""}
                </p>
              </div>
              <WalletStatusBadge status={doc.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
