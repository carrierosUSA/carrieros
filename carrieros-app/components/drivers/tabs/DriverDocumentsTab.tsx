"use client";

import { useState } from "react";
import { DRIVER_DOCUMENT_TYPE_LABELS } from "@/lib/types";
import type { DriverDocument, DriverDocumentType } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverDocumentsTabProps = {
  driverId: string;
  documents: DriverDocument[];
};

const documentTypes = Object.keys(
  DRIVER_DOCUMENT_TYPE_LABELS,
) as DriverDocumentType[];

function statusStyles(status: DriverDocument["status"]) {
  switch (status) {
    case "valid":
      return CARRIEROS_COLORS.success;
    case "expiring":
      return CARRIEROS_COLORS.warning;
    case "expired":
      return CARRIEROS_COLORS.critical;
    default:
      return CARRIEROS_COLORS.disabled;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DriverDocumentsTab({
  documents,
}: DriverDocumentsTabProps) {
  const [revealedSecured, setRevealedSecured] = useState<Set<string>>(new Set());

  function toggleSecured(id: string) {
    setRevealedSecured((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const grouped = documentTypes.map((type) => ({
    type,
    label: DRIVER_DOCUMENT_TYPE_LABELS[type],
    items: documents.filter((doc) => doc.type === type),
  }));

  return (
    <div className="space-y-4" id="driver-documents">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-slate-600">
          {documents.length} document{documents.length === 1 ? "" : "s"} on file
        </p>
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
          title="Document upload will connect to your document service"
        >
          + Upload Document
        </button>
      </div>

      {grouped.map((group) => (
        <section
          key={group.type}
          className="rounded-[16px] bg-white p-5 ring-1 ring-[#E5E7EB]"
        >
          <h3 className="text-[14px] font-semibold text-slate-950">{group.label}</h3>

          {group.items.length === 0 ? (
            <p className="mt-2 text-[13px] text-slate-500">Not on file</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {group.items.map((doc) => {
                const tone = statusStyles(doc.status);
                const securedHidden = doc.secured && !revealedSecured.has(doc.id);

                return (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#E5E7EB]"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">
                        {securedHidden ? "••• Secured Document •••" : doc.name}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Uploaded {formatDate(doc.uploadedAt)}
                        {doc.expiresAt ? ` · Expires ${formatDate(doc.expiresAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.secured ? (
                        <button
                          type="button"
                          onClick={() => toggleSecured(doc.id)}
                          className="text-[12px] font-semibold text-[#2563EB]"
                        >
                          {securedHidden ? "Reveal" : "Hide"}
                        </button>
                      ) : null}
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
