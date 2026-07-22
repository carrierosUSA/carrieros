"use client";

import { useState } from "react";
import { GlowingStarIcon } from "@/components/dispatch/load-detail/LoadDetailAlphIssueActions";
import type {
  DocumentPickupNumberReview,
  DocumentReviewCorrection,
  PersistedDocumentReview,
} from "@/lib/alph/document-intake";
import {
  normalizePickupNumbers,
} from "@/lib/loads/pickup-numbers";
import type { PickupNumber } from "@/lib/types/pickup-number";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/types/documents";

type DocumentAlphOcrReviewProps = {
  status: "idle" | "processing" | "ready" | "error";
  record: PersistedDocumentReview | null;
  errorMessage?: string;
  confirming?: boolean;
  retrying?: boolean;
  onApply: (
    corrections: DocumentReviewCorrection[],
    pickupNumbers: DocumentPickupNumberReview[],
  ) => void;
  onRetry: () => void;
  onDismiss: () => void;
};

function ReadyReview({
  record,
  errorMessage,
  confirming,
  retrying,
  onApply,
  onRetry,
  onDismiss,
}: {
  record: PersistedDocumentReview;
  errorMessage?: string;
  confirming?: boolean;
  retrying?: boolean;
  onApply: (
    corrections: DocumentReviewCorrection[],
    pickupNumbers: DocumentPickupNumberReview[],
  ) => void;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      record.document.extractedFields.map((field) => [field.key, field.value]),
    ),
  );
  const [pickupNumbers, setPickupNumbers] = useState<PickupNumber[]>(() =>
    record.pickupNumbers.map((entry, index) => ({
      ...entry,
      id: entry.id || `extracted-${index}`,
      displayOrder: index,
    })),
  );
  const [pickupNumberError, setPickupNumberError] = useState<string>();
  const hasFields = record.document.extractedFields.length > 0;
  const hasReviewIds = Boolean(record.ocrResultId && record.proposedActionId);
  const retryRecommended =
    !hasFields || !hasReviewIds || record.overallConfidence < 0.65;

  function addPickupNumber() {
    setPickupNumbers((current) => [
      ...current,
      {
        id: `manual-${Date.now()}-${current.length}`,
        value: "",
        displayOrder: current.length,
        confidence: 0,
        stopAssociationConfidence: 0,
        requiresHumanVerification: true,
        requiresStopAssociationReview: true,
        source: "manual",
      },
    ]);
    setPickupNumberError(undefined);
  }

  function updatePickupNumber(id: string, patch: Partial<PickupNumber>) {
    setPickupNumbers((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
    setPickupNumberError(undefined);
  }

  function removePickupNumber(id: string) {
    setPickupNumbers((current) =>
      current
        .filter((entry) => entry.id !== id)
        .map((entry, index) => ({ ...entry, displayOrder: index })),
    );
    setPickupNumberError(undefined);
  }

  function applyReview() {
    const nonemptyCount = pickupNumbers.filter(
      (entry) => entry.value.trim().length > 0,
    ).length;
    const normalized = normalizePickupNumbers(pickupNumbers);
    if (normalized.length !== nonemptyCount) {
      setPickupNumberError(
        "Remove the exact duplicate pickup number before confirming.",
      );
      return;
    }
    onApply(
      record.document.extractedFields.map((field) => ({
        key: field.key,
        value: values[field.key] ?? "",
      })),
      normalized.map((entry, index) => ({
        id: entry.id?.startsWith("manual-") ? undefined : entry.id,
        value: entry.value,
        label: entry.label,
        pickupStopId: entry.pickupStopId,
        pickupStopLabel: entry.pickupStopLabel,
        displayOrder: index,
      })),
    );
  }

  return (
    <div className="rounded-[16px] border border-[#BBF7D0] bg-[#ECFDF3]/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold text-slate-950">Alph AI OCR</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              <GlowingStarIcon />
              Ready for human review
            </span>
          </div>
          <p className="mt-1 text-[13px] text-slate-600">
            {record.document.filename} ·{" "}
            {DOCUMENT_CATEGORY_LABELS[record.document.category]} ·{" "}
            {Math.round(record.overallConfidence * 100)}% overall confidence
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="overflow-hidden rounded-[14px] border border-[#D5DBE5] bg-white">
          <div className="border-b border-[#EAEAEA] px-3 py-2 text-[12px] font-semibold text-slate-600">
            Original document
          </div>
          {record.document.previewUrl ? (
            <iframe
              title="Original uploaded document"
              src={record.document.previewUrl}
              className="h-[420px] w-full bg-[#F8FAFC]"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center px-6 text-center text-[13px] text-slate-500">
              The private preview could not be opened. The original remains stored.
            </div>
          )}
        </section>

        <section className="rounded-[14px] border border-[#D5DBE5] bg-white p-3">
          <p className="text-[12px] font-semibold text-slate-600">
            Extracted fields — verify every value
          </p>
          <div className="mt-3 max-h-[382px] space-y-2 overflow-y-auto pr-1">
            {record.document.extractedFields.length ? (
              record.document.extractedFields.map((field) => (
                <label
                  key={field.key}
                  className="block rounded-xl border border-[#EAEAEA] px-3 py-2.5"
                >
                  <span className="flex items-center justify-between gap-3 text-[12px] font-medium text-slate-500">
                    {field.label}
                    <span
                      className={
                        field.confidence < 0.85
                          ? "font-semibold text-amber-700"
                          : "font-semibold text-emerald-700"
                      }
                    >
                      {Math.round(field.confidence * 100)}%
                      {field.confidence < 0.85
                        ? " · Needs human verification"
                        : ""}
                    </span>
                  </span>
                  <input
                    value={values[field.key] ?? ""}
                    maxLength={4_000}
                    disabled={confirming || retrying}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="mt-1.5 h-10 w-full rounded-[10px] border border-[#CBD5E1] px-3 text-[14px] font-semibold text-slate-900 outline-none focus:border-[#2563EB] disabled:bg-slate-50"
                  />
                </label>
              ))
            ) : (
              <p className="rounded-xl bg-[#FFF7ED] px-3 py-3 text-[13px] text-[#9A3412]">
                No reliable fields were extracted. Retry extraction from the
                stored original before approval.
              </p>
            )}

            {record.document.category === "rate_confirmation" ? (
              <div className="mt-4 border-t border-[#EAEAEA] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">
                      Pickup Numbers
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Optional · verify the value and pickup-stop association.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={confirming || retrying}
                    onClick={addPickupNumber}
                    className="shrink-0 text-[12px] font-semibold text-[#2563EB] disabled:opacity-50"
                  >
                    + Add pickup number
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {pickupNumbers.length ? (
                    pickupNumbers.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="rounded-xl border border-[#D8E1EE] bg-[#F8FAFC] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1E3A8A]">
                            Pickup number {index + 1}
                          </p>
                          <button
                            type="button"
                            disabled={confirming || retrying}
                            onClick={() => removePickupNumber(entry.id)}
                            className="text-[11px] font-semibold text-rose-600 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                        <label className="mt-2 block text-[11px] font-medium text-slate-500">
                          Value
                          <input
                            value={entry.value}
                            maxLength={500}
                            disabled={confirming || retrying}
                            onChange={(event) =>
                              updatePickupNumber(entry.id, {
                                value: event.target.value,
                              })
                            }
                            placeholder="Optional pickup number"
                            className="mt-1 h-10 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] font-bold text-slate-950 outline-none focus:border-[#2563EB]"
                          />
                        </label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <label className="block text-[11px] font-medium text-slate-500">
                            Label / type (optional)
                            <input
                              value={entry.label ?? ""}
                              maxLength={120}
                              disabled={confirming || retrying}
                              onChange={(event) =>
                                updatePickupNumber(entry.id, {
                                  label: event.target.value,
                                })
                              }
                              placeholder="PU#, PO#, release…"
                              className="mt-1 h-9 w-full rounded-[9px] border border-[#CBD5E1] bg-white px-2.5 text-[12px] text-slate-900 outline-none focus:border-[#2563EB]"
                            />
                          </label>
                          <label className="block text-[11px] font-medium text-slate-500">
                            Pickup stop (optional)
                            <input
                              value={entry.pickupStopLabel ?? ""}
                              maxLength={500}
                              disabled={confirming || retrying}
                              onChange={(event) =>
                                updatePickupNumber(entry.id, {
                                  pickupStopLabel: event.target.value,
                                })
                              }
                              placeholder="General load or pickup stop"
                              className="mt-1 h-9 w-full rounded-[9px] border border-[#CBD5E1] bg-white px-2.5 text-[12px] text-slate-900 outline-none focus:border-[#2563EB]"
                            />
                          </label>
                        </div>
                        {entry.source === "ocr" ? (
                          <p
                            className={`mt-2 text-[11px] font-semibold ${
                              entry.requiresHumanVerification ||
                              entry.requiresStopAssociationReview
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {Math.round((entry.confidence ?? 0) * 100)}% value confidence
                            {entry.requiresStopAssociationReview
                              ? " · Stop association needs human review"
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl bg-[#F8FAFC] px-3 py-3 text-[12px] text-slate-500">
                      No pickup numbers. This optional section does not block confirmation.
                    </p>
                  )}
                </div>
                {pickupNumberError ? (
                  <p className="mt-2 text-[11px] font-semibold text-rose-600">
                    {pickupNumberError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <p className="mt-4 text-[12px] leading-5 text-slate-500">
        Confirming records your authenticated approval of document metadata only.
        It does not change loads, invoices, payments, payroll, or financial records.
      </p>
      {errorMessage ? (
        <p className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#B91C1C]">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {retryRecommended ? (
          <button
            type="button"
            disabled={confirming || retrying}
            onClick={onRetry}
            className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-wait disabled:opacity-60"
          >
            {retrying ? "Retrying extraction…" : "Retry extraction"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={confirming || retrying || !hasFields || !hasReviewIds}
          onClick={applyReview}
          className={`inline-flex h-10 items-center rounded-full px-5 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            retryRecommended
              ? "bg-white text-[#2563EB] ring-1 ring-[#BFDBFE] hover:bg-[#EFF6FF]"
              : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          }`}
        >
          {confirming ? "Recording approval…" : "Confirm & Link"}
        </button>
        <button
          type="button"
          disabled={confirming || retrying}
          onClick={onDismiss}
          className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium text-slate-500 transition hover:bg-white hover:text-slate-700 disabled:opacity-60"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function DocumentAlphOcrReview({
  status,
  record,
  errorMessage,
  confirming,
  retrying,
  onApply,
  onRetry,
  onDismiss,
}: DocumentAlphOcrReviewProps) {
  if (status === "idle") return null;

  if (status === "processing") {
    return (
      <div className="rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-5">
        <p className="text-[15px] font-semibold text-slate-950">Alph AI OCR</p>
        <p className="mt-0.5 text-[13px] text-slate-600">
          Storing the original privately, extracting fields, and preparing a read-only review…
        </p>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-10 animate-[carrieros-shimmer_1.4s_ease-in-out_infinite] rounded-xl bg-gradient-to-r from-[#DBEAFE] via-[#EFF6FF] to-[#DBEAFE] bg-[length:200%_100%]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error" || !record) {
    return (
      <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] p-5">
        <p className="text-[15px] font-semibold text-[#B91C1C]">
          Document processing needs attention
        </p>
        <p className="mt-1 text-[14px] text-[#B91C1C]">
          {errorMessage ?? "Try another PDF or image."}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-[13px] font-semibold text-[#2563EB]"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <ReadyReview
      key={`${record.document.id}-${record.ocrResultId ?? "review"}`}
      record={record}
      errorMessage={errorMessage}
      confirming={confirming}
      retrying={retrying}
      onApply={onApply}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}
