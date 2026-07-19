"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, ClipboardCheck, Receipt, Upload } from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import ExpensesForm from "@/components/driver-mobile/ExpensesForm";
import DvirFlow from "@/components/driver-mobile/DvirFlow";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
} from "@/components/driver-mobile/ui";
import { DRIVER_DOC_UPLOAD_TYPES } from "@/lib/driver-mobile/constants";
import type { DriverDocUploadType } from "@/lib/driver-mobile/types";

export default function DocumentsUpload() {
  const { state, uploadDocument } = useDriverMobile();
  const params = useSearchParams();
  const view = params.get("view");
  const [docType, setDocType] = useState<DriverDocUploadType>("pod");
  const [toast, setToast] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  if (view === "expenses") return <ExpensesForm />;
  if (view === "dvir") return <DvirFlow />;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    uploadDocument({
      type: docType,
      fileName: file.name,
      loadId: state.todaysLoadId,
    });
    setToast(`${file.name} saved`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Documents</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Camera, gallery, or PDF — works offline too.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/driver/expenses"
          className="flex min-h-[72px] flex-col justify-center rounded-[18px] bg-[var(--dm-surface)] px-4"
        >
          <Receipt className="h-5 w-5 text-[var(--color-info)]" />
          <span className="mt-2 text-[15px] font-semibold">Expenses</span>
        </a>
        <a
          href="/driver/dvir"
          className="flex min-h-[72px] flex-col justify-center rounded-[18px] bg-[var(--dm-surface)] px-4"
        >
          <ClipboardCheck className="h-5 w-5 text-[var(--color-success)]" />
          <span className="mt-2 text-[15px] font-semibold">DVIR</span>
        </a>
      </div>

      <DmSectionLabel>Upload type</DmSectionLabel>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DRIVER_DOC_UPLOAD_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setDocType(t.id)}
            className={`shrink-0 rounded-full px-3.5 py-2.5 text-[13px] font-semibold ${
              docType === t.id
                ? "bg-[var(--color-info)] text-white"
                : "bg-[var(--dm-surface)] text-[var(--dm-fg)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DmCard className="space-y-3">
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <DmPrimaryButton onClick={() => cameraRef.current?.click()}>
          <Camera className="h-5 w-5" /> Take photo
        </DmPrimaryButton>
        <DmPrimaryButton tone="muted" onClick={() => galleryRef.current?.click()}>
          <Upload className="h-5 w-5" /> Choose from gallery
        </DmPrimaryButton>
        <DmPrimaryButton tone="muted" onClick={() => pdfRef.current?.click()}>
          Upload PDF
        </DmPrimaryButton>
      </DmCard>

      {state.documents.length > 0 && (
        <>
          <DmSectionLabel>Recent uploads</DmSectionLabel>
          <div className="space-y-2">
            {state.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-[18px] bg-[var(--dm-surface)] px-4 py-3.5"
              >
                <div>
                  <p className="text-[15px] font-semibold uppercase">{doc.type.replace(/_/g, " ")}</p>
                  <p className="text-[13px] text-[var(--dm-muted)]">{doc.fileName}</p>
                </div>
                <StatusChip
                  label={doc.status}
                  tone={doc.status === "queued" ? "warning" : "success"}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--dm-fg)] px-4 py-2.5 text-[14px] font-semibold text-[var(--dm-bg)]">
          {toast}
        </div>
      )}
    </div>
  );
}
