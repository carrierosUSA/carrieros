"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { usePortal } from "@/components/portal/PortalProvider";
import PermissionButton from "@/components/portal/PermissionButton";
import {
  PortalBadge,
  PortalCard,
  PortalEmpty,
  PortalSectionTitle,
} from "@/components/portal/ui";
import type { PortalDocumentKind } from "@/lib/portal/types";

const KIND_LABELS: Record<PortalDocumentKind, string> = {
  pod: "POD",
  bol: "BOL",
  invoice: "Invoice",
  rate_con: "Rate Con",
  temp_log: "Temp Log",
  photo: "Photos",
  revised_rc: "Revised RC",
  pickup_docs: "Pickup Documents",
  delivery_docs: "Delivery Documents",
};

const UPLOAD_KINDS: PortalDocumentKind[] = [
  "rate_con",
  "revised_rc",
  "pickup_docs",
  "delivery_docs",
];

export default function PortalDocuments() {
  const { session, documents, uploadDocument } = usePortal();
  const [toast, setToast] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  if (!session) return null;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Documents"
        subtitle="Download POD, BOL, invoices, and rate cons — or upload revised paperwork."
        action={
          <PermissionButton
            role={session.role}
            permission="upload_documents"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Upload className="h-4 w-4" />
            Upload
          </PermissionButton>
        }
      />

      {toast ? (
        <div className="rounded-xl bg-[#ECFDF3] px-4 py-3 text-sm font-medium text-[#166534]">
          {toast}
        </div>
      ) : null}

      <PortalCard>
        {documents.length === 0 ? (
          <PortalEmpty
            title="No documents"
            body="Shipment documents will appear here as they are uploaded."
          />
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#111827]">{doc.name}</p>
                    <PortalBadge
                      tone={
                        doc.status === "awaiting_review"
                          ? "orange"
                          : doc.status === "available"
                            ? "green"
                            : "blue"
                      }
                    >
                      {KIND_LABELS[doc.kind]}
                    </PortalBadge>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {doc.loadReference ?? "General"} · {doc.sizeLabel} ·{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <PermissionButton
                  role={session.role}
                  permission="download_documents"
                  onClick={() => flash(`Downloading ${doc.name}…`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5F7FA] px-3 py-2 text-[13px] font-semibold text-[#374151]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </PermissionButton>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      {showUpload ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Upload document</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Choose a document type. Files are stubbed for demo.
            </p>
            <div className="mt-4 space-y-2">
              {UPLOAD_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    uploadDocument({
                      companyId: session.companyId,
                      kind,
                      name: `${KIND_LABELS[kind]} upload ${new Date().toLocaleDateString()}.pdf`,
                      sizeLabel: "128 KB",
                      loadReference: "Pending link",
                      status: "uploaded",
                    });
                    setShowUpload(false);
                    flash(`${KIND_LABELS[kind]} uploaded.`);
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-[#F8F9FB] px-4 py-3 text-left text-sm font-semibold text-[#111827] transition hover:bg-[#EFF6FF]"
                >
                  {KIND_LABELS[kind]}
                  <Upload className="h-4 w-4 text-[#2563EB]" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="mt-4 h-11 w-full rounded-xl bg-[#F3F4F6] text-sm font-semibold text-[#374151]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
