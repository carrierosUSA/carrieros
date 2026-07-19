"use client";

import { useRef, useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { DOC_KIND_OPTIONS } from "@/lib/driver-app/constants";
import type { DriverDocKind } from "@/lib/driver-app/types";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
} from "@/components/driver-mobile/ui";

export default function DocumentsEngine() {
  const { state, uploadDocument, processPod } = useDriverApp();
  const [kind, setKind] = useState<DriverDocKind>("pod");
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Documents</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          AI document engine — capture, identify, extract, link to load & equipment.
        </p>
      </div>

      <DmCard className="space-y-4">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--dm-muted)]">
          Document type
        </p>
        <div className="flex flex-wrap gap-2">
          {DOC_KIND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setKind(opt.id)}
              className={`min-h-11 rounded-full px-3.5 text-[13px] font-semibold ${
                kind === opt.id
                  ? "bg-[var(--color-info)] text-white"
                  : "bg-[var(--dm-elevated)] text-[var(--dm-fg)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (kind === "pod") {
              const doc = processPod({ fileName: file.name });
              setLastSummary(doc.podAi?.summary ?? doc.aiSummary ?? null);
            } else {
              const doc = uploadDocument({
                kind,
                fileName: file.name,
                fileSize: file.size,
                lastModified: file.lastModified,
              });
              setLastSummary(doc.aiSummary ?? doc.ocr?.summary ?? null);
            }
            e.target.value = "";
          }}
        />

        <DmPrimaryButton onClick={() => fileRef.current?.click()}>
          <Camera className="h-5 w-5" /> Capture / Upload
        </DmPrimaryButton>

        {lastSummary && (
          <div className="rounded-2xl bg-blue-500/10 px-4 py-3">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-info)]">
              <Sparkles className="h-4 w-4" /> AI summary
            </p>
            <p className="mt-1 text-[14px] leading-relaxed">{lastSummary}</p>
          </div>
        )}
      </DmCard>

      <DmSectionLabel>Recent uploads</DmSectionLabel>
      {state.documents.length === 0 ? (
        <DmCard>
          <p className="text-[15px] font-semibold">No documents yet</p>
          <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
            Capture a POD, BOL, fuel receipt, or compliance doc to get started.
          </p>
        </DmCard>
      ) : (
        <div className="space-y-3">
          {state.documents.map((doc) => (
            <DmCard key={doc.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold">{doc.categoryLabel}</p>
                  <p className="text-[13px] text-[var(--dm-muted)]">{doc.fileName}</p>
                </div>
                <StatusChip
                  label={doc.status === "queued" ? "Queued" : "Synced"}
                  tone={doc.status === "queued" ? "warning" : "success"}
                />
              </div>
              {doc.aiSummary && (
                <p className="text-[13px] leading-relaxed text-[var(--dm-muted)]">
                  {doc.aiSummary}
                </p>
              )}
              {doc.ocr && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(doc.ocr.fields)
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded-full bg-[var(--dm-elevated)] px-2.5 py-1 text-[12px] font-medium"
                      >
                        {k}: {v}
                      </span>
                    ))}
                </div>
              )}
              {doc.podAi?.invoiceReady && (
                <p className="text-[13px] font-semibold text-[var(--color-success)]">
                  Ready for invoice · Dispatch & accounting notified
                </p>
              )}
            </DmCard>
          ))}
        </div>
      )}
    </div>
  );
}
