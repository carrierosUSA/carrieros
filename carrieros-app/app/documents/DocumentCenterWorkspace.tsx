"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  confirmDocumentCenterReviewAction,
  retryDocumentCenterExtractionAction,
  uploadDocumentCenterAction,
} from "@/app/actions/document-center";
import { createDraftLoadFromRateConfirmationAction } from "@/app/actions/load-intake";
import type { PersistedDocumentReview } from "@/lib/alph/document-intake";

export default function DocumentCenterWorkspace({
  initialRecords,
  canApprove,
  canCreateLoad,
}: {
  initialRecords: PersistedDocumentReview[];
  canApprove: boolean;
  canCreateLoad: boolean;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [selected, setSelected] = useState<PersistedDocumentReview | null>(
    initialRecords[0] ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const update = (record: PersistedDocumentReview) => {
    setRecords((current) => [
      record,
      ...current.filter((item) => item.id !== record.id),
    ]);
    setSelected(record);
  };

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    const data = new FormData();
    data.set("file", file);
    const result = await uploadDocumentCenterAction(data);
    if (result.record) update(result.record);
    setMessage(result.ok ? result.message : result.error);
    setBusy(false);
  }

  async function retry() {
    if (!selected) return;
    setBusy(true);
    const result = await retryDocumentCenterExtractionAction({
      documentId: selected.id,
    });
    if (result.ok) update(result.record);
    setMessage(result.ok ? result.message : result.error);
    setBusy(false);
  }

  async function confirm() {
    if (!selected?.ocrResultId || !selected.proposedActionId) return;
    setBusy(true);
    const corrections = selected.fields.map((field) => ({
      fieldKey: field.key,
      value: field.value,
    }));
    const result = await confirmDocumentCenterReviewAction({
      documentId: selected.id,
      ocrResultId: selected.ocrResultId,
      proposedActionId: selected.proposedActionId,
      corrections,
    });
    if (result.ok) update(result.record);
    setMessage(
      result.ok
        ? "Human review confirmed. No load or financial record changed."
        : result.error,
    );
    setBusy(false);
  }

  async function createDraftLoad() {
    if (!selected) return;
    setBusy(true);
    setMessage("");
    const result = await createDraftLoadFromRateConfirmationAction({
      documentId: selected.id,
    });
    if (result.ok) {
      update({ ...selected, operationalLoadId: result.loadId });
      setMessage(
        result.existing
          ? "The existing verified load was opened safely."
          : "Pending load created with human approval. No driver was assigned and no movement was authorized.",
      );
    } else {
      setMessage(result.error);
    }
    setBusy(false);
  }

  return (
    <section className="min-h-screen px-4 pb-8 pt-20 lg:ml-72 lg:px-8 lg:py-7 xl:px-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">
              AI document intake
            </p>
            <h1 className="mt-2 text-[34px] font-semibold">Document Center</h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Upload → AI extracts → human reviews → human confirms → human
              creates a pending load.
            </p>
          </div>
          <button
            disabled={busy}
            onClick={() => input.current?.click()}
            className="rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Working securely…" : "Upload document"}
          </button>
          <input
            ref={input}
            hidden
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(event) => void upload(event.target.files?.[0])}
          />
        </header>

        {message && (
          <p className="mt-4 rounded-xl border border-[#DDE5F0] bg-white px-4 py-3 text-xs text-[#475569]">
            {message}
          </p>
        )}

        <div className="mt-6 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-[22px] border border-[#DDE5F0] bg-white p-4">
            <h2 className="text-sm font-semibold">Authorized documents</h2>
            <div className="mt-3 space-y-2">
              {records.length ? (
                records.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setSelected(record)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      selected?.id === record.id
                        ? "border-[#93C5FD] bg-[#EFF6FF]"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <b className="block truncate text-xs">{record.filename}</b>
                    <span className="mt-1 block text-[11px] capitalize text-[#64748B]">
                      {record.category.replaceAll("_", " ")} ·{" "}
                      {record.status.replaceAll("_", " ")}
                    </span>
                  </button>
                ))
              ) : (
                <p className="rounded-xl bg-[#F8FAFC] p-4 text-xs text-[#64748B]">
                  No verified documents yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#DDE5F0] bg-white p-5">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#64748B]">
                      Human review
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">
                      {selected.filename}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#F1F5F9] px-3 py-1.5 text-xs font-semibold capitalize">
                    {selected.approvalStatus}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selected.fields.length ? (
                    selected.fields.map((field, index) => (
                      <label
                        key={field.key}
                        className="text-xs font-semibold text-[#475569]"
                      >
                        {field.label}
                        <input
                          value={field.value}
                          disabled={selected.approvalStatus === "approved"}
                          onChange={(event) =>
                            setSelected({
                              ...selected,
                              fields: selected.fields.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, value: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 font-normal text-[#0F172A] disabled:bg-[#F8FAFC]"
                        />
                        <span className="mt-1 block text-[10px] font-normal text-[#94A3B8]">
                          AI confidence {Math.round(field.confidence * 100)}% ·
                          verify against original
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-[#64748B]">
                      No extracted fields are available.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    disabled={busy}
                    onClick={() => void retry()}
                    className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
                  >
                    Retry extraction
                  </button>
                  {canApprove && selected.approvalStatus !== "approved" && (
                    <button
                      disabled={
                        busy ||
                        !selected.ocrResultId ||
                        !selected.proposedActionId
                      }
                      onClick={() => void confirm()}
                      className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Confirm human review
                    </button>
                  )}
                </div>

                {selected.category === "rate_confirmation" &&
                  selected.approvalStatus === "approved" && (
                    <div className="mt-6 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#2563EB]">
                        Operational approval
                      </p>
                      <h3 className="mt-2 text-sm font-semibold">
                        Create a pending load
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#475569]">
                        The server re-reads human-verified fields. This action
                        creates the load, two verified stops, and an audit event.
                        It does not assign a driver or authorize movement.
                      </p>
                      {selected.operationalLoadId ? (
                        <Link
                          href={`/dispatch/${selected.operationalLoadId}`}
                          className="mt-3 inline-flex rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white"
                        >
                          Open pending load
                        </Link>
                      ) : canCreateLoad ? (
                        <button
                          disabled={busy}
                          onClick={() => void createDraftLoad()}
                          className="mt-3 rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Approve &amp; create pending load
                        </button>
                      ) : (
                        <p className="mt-3 text-xs font-semibold text-[#64748B]">
                          Owner or dispatcher approval is required.
                        </p>
                      )}
                    </div>
                  )}
              </>
            ) : (
              <div className="grid min-h-72 place-items-center text-sm text-[#64748B]">
                Select a verified document.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
