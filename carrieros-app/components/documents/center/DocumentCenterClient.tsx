"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import DocumentAlphOcrReview from "@/components/documents/center/DocumentAlphOcrReview";
import DocumentCard from "@/components/documents/center/DocumentCard";
import DocumentDashboardStats from "@/components/documents/center/DocumentDashboardStats";
import DocumentFilters from "@/components/documents/center/DocumentFilters";
import DocumentPreviewModal from "@/components/documents/center/DocumentPreviewModal";
import DocumentSearchBar from "@/components/documents/center/DocumentSearchBar";
import DocumentUploadZone from "@/components/documents/center/DocumentUploadZone";
import FadeIn from "@/components/ui/FadeIn";
import type { CarrierOSRole } from "@/lib/auth/session";
import {
  buildDocumentDashboardStats,
  countDocumentsByCategory,
  filterDocuments,
} from "@/lib/documents/document-board";
import {
  applyOcrLinksToDocument,
  extractDocumentWithAlph,
  type DocumentOcrResult,
  type DocumentOcrStatus,
} from "@/lib/documents/document-ocr";
import { checkDocumentPermission } from "@/lib/documents/document-permissions";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type {
  CarrierDocument,
  DocumentCategory,
} from "@/lib/types/documents";
import { DOCUMENT_CATEGORIES } from "@/lib/types/documents";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

type DocumentCenterClientProps = {
  initialDocuments: CarrierDocument[];
  role: CarrierOSRole;
};

function parseCategoryParam(
  value: string | null,
): DocumentCategory | "all" {
  if (value && (DOCUMENT_CATEGORIES as readonly string[]).includes(value)) {
    return value as DocumentCategory;
  }
  return "all";
}

function parseStatusParam(
  value: string | null,
): "active" | "pending_review" | "missing" | "expiring" | "deleted" {
  if (
    value === "pending_review" ||
    value === "missing" ||
    value === "expiring" ||
    value === "deleted"
  ) {
    return value;
  }
  return "active";
}

export default function DocumentCenterClient({
  initialDocuments,
  role,
}: DocumentCenterClientProps) {
  const searchParams = useSearchParams();
  const uploadRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DocumentCategory | "all">(() =>
    parseCategoryParam(searchParams?.get("category") ?? null),
  );
  const [statusFilter, setStatusFilter] = useState<
    "active" | "pending_review" | "missing" | "expiring" | "deleted"
  >(() => parseStatusParam(searchParams?.get("status") ?? null));
  const [previewDoc, setPreviewDoc] = useState<CarrierDocument | null>(null);
  const [ocrStatus, setOcrStatus] = useState<DocumentOcrStatus>("idle");
  const [ocrResult, setOcrResult] = useState<DocumentOcrResult | null>(null);
  const [ocrError, setOcrError] = useState<string | undefined>();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCategory(parseCategoryParam(searchParams?.get("category") ?? null));
    setStatusFilter(parseStatusParam(searchParams?.get("status") ?? null));
    const focus = searchParams?.get("focus");
    if (focus === "upload") {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (focus === "search") {
      searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const uploadPermission = checkDocumentPermission(role, "upload");

  const stats = useMemo(
    () => buildDocumentDashboardStats(documents),
    [documents],
  );

  const categoryCounts = useMemo(
    () => countDocumentsByCategory(documents),
    [documents],
  );

  const filtered = useMemo(
    () =>
      filterDocuments(documents, {
        query,
        category,
        status: statusFilter === "active" ? "active" : statusFilter,
      }),
    [documents, query, category, statusFilter],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  async function handleFilesSelected(files: File[]) {
    if (!uploadPermission.allowed) {
      showToast(uploadPermission.reason ?? "Upload not allowed");
      return;
    }

    const file = files[0];
    if (!file) return;

    setPendingFile(file);
    setOcrStatus("processing");
    setOcrResult(null);
    setOcrError(undefined);

    try {
      const result = await extractDocumentWithAlph(file);
      setOcrResult(result);
      setOcrStatus("ready");
      if (files.length > 1) {
        showToast(`Queued ${files.length} files — reviewing first file with Alph`);
      }
    } catch (error) {
      setOcrStatus("error");
      setOcrError(error instanceof Error ? error.message : "OCR failed");
    }
  }

  function handleApplyOcr() {
    if (!ocrResult || !pendingFile) return;

    const now = new Date().toISOString();
    const id = `cdoc-upload-${Date.now()}`;

    const draft: CarrierDocument = {
      tenantId: DEMO_TENANT_ID,
      id,
      category: ocrResult.category,
      filename: pendingFile.name,
      mimeType: pendingFile.type || "application/pdf",
      sizeBytes: pendingFile.size,
      uploadedAt: now,
      uploadedBy: "Alpha Owner",
      status: "pending_review",
      extractedFields: [],
      tags: [],
      links: {},
      versions: [
        {
          id: `${id}-v1`,
          version: 1,
          filename: pendingFile.name,
          sizeBytes: pendingFile.size,
          uploadedAt: now,
          uploadedBy: "Alpha Owner",
        },
      ],
      auditLog: [
        {
          id: `${id}-a1`,
          action: "uploaded",
          actorName: "Alpha Owner",
          actorRole: role,
          occurredAt: now,
        },
      ],
      timeline: [
        {
          id: `${id}-t1`,
          documentId: id,
          type: "uploaded",
          label: "Document uploaded",
          occurredAt: now,
          actorName: "Alpha Owner",
        },
      ],
      storageProvider: "local",
      encrypted: true,
    };

    const linked = applyOcrLinksToDocument(draft, ocrResult);
    const withAudit: CarrierDocument = {
      ...linked,
      auditLog: [
        {
          id: `${id}-a2`,
          action: "ocr_applied",
          actorName: "Alph AI",
          actorRole: "system",
          occurredAt: now,
        },
        {
          id: `${id}-a3`,
          action: "linked",
          actorName: "Alpha Owner",
          actorRole: role,
          occurredAt: now,
          detail: "Links confirmed after Alph review",
        },
        ...linked.auditLog,
      ],
      timeline: [
        {
          id: `${id}-t2`,
          documentId: id,
          type: "ocr_reviewed",
          label: "Alph OCR confirmed",
          occurredAt: now,
          actorName: "Alpha Owner",
        },
        {
          id: `${id}-t3`,
          documentId: id,
          type: "linked",
          label: "Entity links applied",
          occurredAt: now,
          actorName: "Alpha Owner",
        },
        ...linked.timeline,
      ],
    };

    startTransition(() => {
      setDocuments((prev) => [withAudit, ...prev]);
    });

    setOcrStatus("idle");
    setOcrResult(null);
    setPendingFile(null);
    showToast("Document linked and added to Document Center");
  }

  function dismissOcr() {
    setOcrStatus("idle");
    setOcrResult(null);
    setPendingFile(null);
    setOcrError(undefined);
  }

  const statusChips: Array<{
    id: typeof statusFilter;
    label: string;
  }> = [
    { id: "active", label: "Active" },
    { id: "pending_review", label: "Pending review" },
    { id: "missing", label: "Missing" },
    { id: "expiring", label: "Expiring" },
    { id: "deleted", label: "Trash" },
  ];

  return (
    <FadeIn className="space-y-6">
      <DocumentDashboardStats stats={stats} />

      {(stats.missingDocuments > 0 ||
        stats.pendingReview > 0 ||
        stats.expiringDocuments > 0) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.missingDocuments > 0 ? (
            <div
              className={`rounded-[14px] px-4 py-3 text-left ring-1 ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`}
            >
              <button
                type="button"
                onClick={() => setStatusFilter("missing")}
                className="w-full text-left"
              >
                <p className={`text-[13px] font-semibold ${CARRIEROS_COLORS.warning.text}`}>
                  Missing documents
                </p>
                <p className="mt-0.5 text-[12px] text-slate-600">
                  {stats.missingDocuments} need upload before packets can close
                </p>
              </button>
              <Link
                href="/documents/health"
                className={`mt-2 inline-flex text-[12px] font-semibold underline-offset-2 hover:underline ${CARRIEROS_COLORS.warning.text}`}
              >
                Open Document Health →
              </Link>
            </div>
          ) : null}
          {stats.pendingReview > 0 ? (
            <button
              type="button"
              onClick={() => setStatusFilter("pending_review")}
              className={`rounded-[14px] px-4 py-3 text-left ring-1 ${CARRIEROS_COLORS.info.bg} ${CARRIEROS_COLORS.info.border}`}
            >
              <p className={`text-[13px] font-semibold ${CARRIEROS_COLORS.info.text}`}>
                Pending Alph review
              </p>
              <p className="mt-0.5 text-[12px] text-slate-600">
                {stats.pendingReview} waiting for confirmation
              </p>
            </button>
          ) : null}
          {stats.expiringDocuments > 0 ? (
            <button
              type="button"
              onClick={() => setStatusFilter("expiring")}
              className={`rounded-[14px] px-4 py-3 text-left ring-1 ${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.border}`}
            >
              <p className={`text-[13px] font-semibold ${CARRIEROS_COLORS.critical.text}`}>
                Expiring soon
              </p>
              <p className="mt-0.5 text-[12px] text-slate-600">
                {stats.expiringDocuments} need renewal attention
              </p>
            </button>
          ) : null}
        </div>
      )}

      <div ref={uploadRef}>
        <DocumentUploadZone
          disabled={!uploadPermission.allowed}
          disabledReason={uploadPermission.reason}
          uploading={ocrStatus === "processing"}
          onFilesSelected={handleFilesSelected}
        />
      </div>

      <DocumentAlphOcrReview
        status={ocrStatus}
        result={ocrResult}
        errorMessage={ocrError}
        onApply={handleApplyOcr}
        onDismiss={dismissOcr}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-slate-900">All documents</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/documents/health"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Document Health
            </Link>
            <Link
              href="/documents/packets/load-24002"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
            >
              Load packets
            </Link>
          </div>
        </div>

        <div ref={searchRef}>
          <DocumentSearchBar
            value={query}
            onChange={setQuery}
            resultCount={filtered.length}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={`inline-flex shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                statusFilter === chip.id
                  ? "bg-slate-900 text-white"
                  : "bg-[#F8FAFC] text-slate-600 ring-1 ring-[#EAEAEA] hover:bg-white"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <DocumentFilters
          category={category}
          onChange={setCategory}
          counts={categoryCounts}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
          <p className="text-[15px] font-semibold text-slate-900">No documents found</p>
          <p className="mt-1 text-[14px] text-slate-500">
            Try a different search, clear filters, or upload a new file.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onPreview={setPreviewDoc}
            />
          ))}
        </div>
      )}

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </FadeIn>
  );
}
