"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DocumentAuditLog from "@/components/documents/center/DocumentAuditLog";
import DocumentPreviewModal from "@/components/documents/center/DocumentPreviewModal";
import DocumentQuickActions from "@/components/documents/center/DocumentQuickActions";
import DocumentStatusBadge from "@/components/documents/center/DocumentStatusBadge";
import DocumentTimeline from "@/components/documents/center/DocumentTimeline";
import DocumentVersionHistory from "@/components/documents/center/DocumentVersionHistory";
import FadeIn from "@/components/ui/FadeIn";
import type { CarrierOSRole } from "@/lib/auth/session";
import {
  formatDocumentDateTime,
  formatFileSize,
  getLinkSummary,
} from "@/lib/documents/document-board";
import { DOCUMENT_ROLE_BADGE_COPY } from "@/lib/documents/document-permissions";
import {
  DOCUMENT_CATEGORY_LABELS,
  type CarrierDocument,
} from "@/lib/types/documents";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DocumentDetailTab = "overview" | "ocr" | "timeline" | "audit" | "versions";

type DocumentDetailShellProps = {
  document: CarrierDocument;
  role: CarrierOSRole;
};

const TABS: Array<{ id: DocumentDetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "ocr", label: "OCR Fields" },
  { id: "timeline", label: "Timeline" },
  { id: "audit", label: "Audit Log" },
  { id: "versions", label: "Versions" },
];

export default function DocumentDetailShell({
  document: initial,
  role,
}: DocumentDetailShellProps) {
  const document = initial;
  const [tab, setTab] = useState<DocumentDetailTab>("overview");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  const linkRows = useMemo(() => {
    const rows: Array<{ label: string; value: string; href?: string }> = [];
    if (document.links.loadId) {
      rows.push({
        label: "Load",
        value: document.loadNumber ?? document.links.loadId,
        href: `/loads/${document.links.loadId}`,
      });
    }
    if (document.links.driverId) {
      rows.push({
        label: "Driver",
        value: document.links.driverId,
        href: `/drivers/${document.links.driverId}`,
      });
    }
    if (document.links.truckId) {
      rows.push({
        label: "Truck",
        value: document.links.truckId.replace("truck-", "Unit "),
        href: `/fleet/trucks/${document.links.truckId}`,
      });
    }
    if (document.links.trailerId) {
      rows.push({
        label: "Trailer",
        value: document.links.trailerId.replace("trailer-", "Trailer "),
        href: "/fleet/trailers",
      });
    }
    if (document.links.brokerId) {
      rows.push({
        label: "Broker",
        value: document.links.brokerId,
        href: `/brokers/${document.links.brokerId}`,
      });
    }
    if (document.links.companyId) {
      rows.push({ label: "Company", value: document.links.companyId });
    }
    return rows;
  }, [document]);

  return (
    <FadeIn className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/documents"
          className="text-[14px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          ← Document Center
        </Link>
        {document.links.loadId ? (
          <Link
            href={`/documents/packets/${document.links.loadId}`}
            className="text-[13px] font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Open load packet →
          </Link>
        ) : null}
      </div>

      <header className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-bold tracking-tight text-slate-950">
                {document.filename}
              </h1>
              <DocumentStatusBadge status={document.status} />
            </div>
            <p className="mt-1 text-[14px] text-slate-500">
              {DOCUMENT_CATEGORY_LABELS[document.category]} ·{" "}
              {formatFileSize(document.sizeBytes)} · Uploaded{" "}
              {formatDocumentDateTime(document.uploadedAt)} by {document.uploadedBy}
            </p>
            <p className="mt-2 text-[13px] text-slate-600">
              Linked to <strong className="text-slate-900">{getLinkSummary(document)}</strong>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <DocumentQuickActions
            document={document}
            role={role}
            unavailableActions={{
              upload: "Not available yet — upload new versions from Document Center.",
              ...(document.previewUrl
                ? {}
                : {
                    download:
                      "Not available yet — the private file URL is unavailable.",
                  }),
              rename: "Not available yet — persisted rename is required.",
              move: "Not available yet — persisted category changes are required.",
              merge: "Not available yet — persisted PDF merge is required.",
              delete: "Not available yet — persisted deletion is required.",
              restore: "Not available yet — persisted restoration is required.",
            }}
            onUpload={() => showToast("Not available yet")}
            onDownload={() => {
              if (!document.previewUrl) {
                showToast("Private download is not available yet");
                return;
              }
              const anchor = window.document.createElement("a");
              anchor.href = document.previewUrl;
              anchor.rel = "noopener noreferrer";
              anchor.target = "_blank";
              anchor.click();
              showToast("Private file opened");
            }}
            onPreview={() => setPreviewOpen(true)}
            onShare={async () => {
              const url = `${window.location.origin}/documents/${document.id}`;
              try {
                await navigator.clipboard.writeText(url);
                showToast("Authenticated document link copied");
              } catch {
                showToast("Could not copy link");
              }
            }}
            onRename={() => showToast("Not available yet")}
            onMove={() => showToast("Not available yet")}
            onMerge={() => showToast("Not available yet")}
            onPrint={() => {
              window.print();
              showToast("Print dialog opened");
            }}
            onDelete={() => showToast("Not available yet")}
            onRestore={() => showToast("Not available yet")}
            onVersionHistory={() => setTab("versions")}
          />
          <p className="mt-3 text-[12px] leading-5 text-slate-500">
            Document metadata is read-only here. Rename, move, merge, delete,
            restore, and version upload are not available until authenticated
            persisted server actions exist.
            {!document.previewUrl
              ? " Private download is not available yet."
              : ""}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text}`}
            title={DOCUMENT_ROLE_BADGE_COPY.encrypted}
          >
            Encrypted · {document.storageProvider.toUpperCase()}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${CARRIEROS_COLORS.info.bg} ${CARRIEROS_COLORS.info.text}`}
            title={`Role: ${role}`}
          >
            Role: {role.replace("_", " ")}
          </span>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              tab === item.id
                ? "bg-[#2563EB] text-white"
                : "bg-[#F8FAFC] text-slate-600 ring-1 ring-[#EAEAEA] hover:bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 sm:p-6">
        {tab === "overview" ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Linked entities</h2>
              {linkRows.length === 0 ? (
                <p className="mt-2 text-[14px] text-slate-500">No entity links yet.</p>
              ) : (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {linkRows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
                    >
                      <dt className="text-[12px] font-medium text-slate-400">{row.label}</dt>
                      <dd className="mt-0.5 text-[14px] font-semibold text-slate-900">
                        {row.href ? (
                          <Link href={row.href} className="text-[#2563EB] hover:underline">
                            {row.value}
                          </Link>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Details</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Invoice #", value: document.invoiceNumber ?? "—" },
                  { label: "PO #", value: document.poNumber ?? "—" },
                  { label: "BOL #", value: document.bolNumber ?? "—" },
                  {
                    label: "Expires",
                    value: document.expiresAt
                      ? formatDocumentDateTime(document.expiresAt)
                      : "—",
                  },
                  {
                    label: "Tags",
                    value: document.tags.length ? document.tags.join(", ") : "—",
                  },
                  { label: "Notes", value: document.notes ?? "—" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
                  >
                    <dt className="text-[12px] font-medium text-slate-400">{row.label}</dt>
                    <dd className="mt-0.5 text-[14px] font-semibold text-slate-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : null}

        {tab === "ocr" ? (
          <div className="space-y-3">
            <p className="text-[13px] text-slate-500">
              OCR text and extracted fields persisted by the authenticated Alph AI workflow.
            </p>
            {document.ocrText ? (
              <p className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 text-[14px] leading-relaxed text-slate-700 ring-1 ring-[#EAEAEA]">
                {document.ocrText}
              </p>
            ) : null}
            {document.extractedFields.length === 0 ? (
              <p className="text-[14px] text-slate-500">No extracted fields yet.</p>
            ) : (
              document.extractedFields.map((field) => (
                <div
                  key={field.key}
                  className="flex items-start justify-between gap-3 rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
                >
                  <div>
                    <p className="text-[12px] font-medium text-slate-400">{field.label}</p>
                    <p className="text-[14px] font-semibold text-slate-900">{field.value}</p>
                  </div>
                  <span className="text-[12px] font-semibold text-emerald-600">
                    {Math.round(field.confidence * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>
        ) : null}

        {tab === "timeline" ? <DocumentTimeline events={document.timeline} /> : null}
        {tab === "audit" ? <DocumentAuditLog entries={document.auditLog} /> : null}
        {tab === "versions" ? (
          <DocumentVersionHistory versions={document.versions} />
        ) : null}
      </section>

      {previewOpen ? (
        <DocumentPreviewModal
          document={document}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </FadeIn>
  );
}
