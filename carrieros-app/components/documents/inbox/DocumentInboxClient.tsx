"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  approveDocumentInboxAction,
  getDocumentInboxSetupAction,
  listDocumentInboxAction,
  rejectDocumentInboxAction,
  requestDocumentInboxApprovalAction,
  uploadDocumentInboxAction,
} from "@/app/actions/document-inbox";
import type { DocumentInboxItem } from "@/lib/alph/document-inbox";

function statusTone(status: DocumentInboxItem["status"]): string {
  switch (status) {
    case "completed":
      return "bg-[#ECFDF5] text-[#15803D]";
    case "awaiting_approval":
    case "draft_ready":
    case "needs_review":
      return "bg-[#FFF7ED] text-[#C2410C]";
    case "rejected":
    case "failed":
      return "bg-[#FEF2F2] text-[#B91C1C]";
    default:
      return "bg-[#F1F5F9] text-[#475569]";
  }
}

export default function DocumentInboxClient({
  initialItems,
}: {
  initialItems: DocumentInboxItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [setupNote, setSetupNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await listDocumentInboxAction();
      setItems(next);
    });
  }, []);

  useEffect(() => {
    void getDocumentInboxSetupAction().then((s) => {
      setSetupNote(`${s.ocr.message}`);
    });
  }, []);

  function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    startTransition(async () => {
      for (const file of Array.from(fileList)) {
        const result = await uploadDocumentInboxAction({
          fileName: file.name,
          mimeType: file.type || undefined,
          byteLength: file.size,
          contentFingerprint: `${file.name.toLowerCase()}::${file.size}::${file.type}`,
        });
        if ("error" in result) {
          setMessage(result.error);
        } else {
          setMessage(
            result.extraction?.isDemoExtraction
              ? `Processed ${file.name} with labeled DEMO extraction.`
              : `Processed ${file.name}.`,
          );
        }
      }
      refresh();
    });
  }

  function requestApproval(itemId: string) {
    startTransition(async () => {
      const result = await requestDocumentInboxApprovalAction(itemId);
      setMessage(
        result.error ??
          (result.approvalId
            ? `Approval ${result.approvalId} ready — review confidence, then approve.`
            : "Approval requested."),
      );
      refresh();
    });
  }

  function approve(itemId: string) {
    startTransition(async () => {
      const result = await approveDocumentInboxAction({ itemId });
      if (result.error) setMessage(result.error);
      else if (result.loadId)
        setMessage(`Load created (${result.loadId}).`);
      else if (result.invoiceId)
        setMessage(`Invoice ready (${result.invoiceId}) — not auto-sent.`);
      else setMessage("Approved.");
      refresh();
    });
  }

  function reject(itemId: string) {
    startTransition(async () => {
      const result = await rejectDocumentInboxAction({
        itemId,
        note: "Rejected from Document Inbox",
      });
      setMessage(result.error ?? "Rejected.");
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[18px] bg-[#F8FAFC] px-5 py-5">
        <p className="text-[15px] font-semibold text-slate-950">
          Drop RC or POD files — Alph classifies, extracts, and prepares drafts
        </p>
        <p className="mt-1 text-[14px] text-slate-600">
          Camera / drag-drop / PDF-image upload. Originals preserved. Writes
          require your approval.
        </p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#CBD5E1] bg-white px-6 py-10 transition hover:border-[#2563EB] hover:bg-[#EFF6FF]">
          <span className="text-[15px] font-semibold text-[#0F172A]">
            Drop files or click to upload
          </span>
          <span className="mt-1 text-[13px] text-[#64748B]">
            PDF, PNG, JPG · try names like LD-24002-pod.pdf or rate-con-new.pdf
          </span>
          <input
            type="file"
            accept="application/pdf,image/*"
            capture="environment"
            multiple
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {setupNote ? (
          <p className="mt-3 text-[13px] text-[#64748B]">{setupNote}</p>
        ) : null}
        {message ? (
          <p className="mt-2 text-[13px] font-medium text-[#2563EB]">{message}</p>
        ) : null}
        {pending ? (
          <p className="mt-2 text-[13px] text-[#64748B]">Working…</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-[14px] text-slate-500">
            Inbox is empty. Upload a rate confirmation or POD to start.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-[16px] bg-white px-5 py-4 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-slate-950">
                    {item.originalFileName}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    {item.category?.replace(/_/g, " ") ?? "unclassified"} ·{" "}
                    {item.workflow.replace(/_/g, " ")} ·{" "}
                    {(item.overallConfidence * 100).toFixed(0)}% confidence
                    {item.extraction?.isDemoExtraction
                      ? " · DEMO extraction"
                      : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusTone(item.status)}`}
                >
                  {item.status.replace(/_/g, " ")}
                </span>
              </div>

              {item.issues.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {item.issues.slice(0, 4).map((issue, idx) => (
                    <li key={`${item.id}-i-${idx}`} className="text-[13px] text-[#C2410C]">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}

              {item.loadDraft ? (
                <p className="mt-3 text-[14px] text-slate-700">
                  Load draft: ${item.loadDraft.rate.toLocaleString()} ·{" "}
                  {item.loadDraft.origin.city}, {item.loadDraft.origin.state} →{" "}
                  {item.loadDraft.destination.city},{" "}
                  {item.loadDraft.destination.state}
                </p>
              ) : null}

              {item.matchedLoadId ? (
                <p className="mt-2 text-[13px] text-slate-600">
                  Matched load{" "}
                  <Link
                    href={`/loads/${item.matchedLoadId}`}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    {item.matchedLoadId}
                  </Link>
                  {item.invoiceDraftId
                    ? ` · invoice draft ${item.invoiceDraftId}`
                    : ""}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {(item.status === "draft_ready" ||
                  item.status === "needs_review") &&
                (item.workflow === "rc_to_load" ||
                  item.workflow === "pod_to_invoice") ? (
                  <button
                    type="button"
                    onClick={() => requestApproval(item.id)}
                    className="inline-flex h-9 items-center rounded-[10px] bg-[#2563EB] px-3 text-[13px] font-semibold text-white"
                  >
                    Request approval
                  </button>
                ) : null}
                {item.status === "awaiting_approval" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => approve(item.id)}
                      className="inline-flex h-9 items-center rounded-[10px] bg-[#16A34A] px-3 text-[13px] font-semibold text-white"
                    >
                      Approve & execute
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(item.id)}
                      className="inline-flex h-9 items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-[#B91C1C] ring-1 ring-[#FECACA]"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                {item.resultLoadId ? (
                  <Link
                    href={`/loads/${item.resultLoadId}`}
                    className="inline-flex h-9 items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE]"
                  >
                    Open load
                  </Link>
                ) : null}
              </div>

              {item.audit[0] ? (
                <p className="mt-3 text-[12px] text-slate-400">
                  Latest: {item.audit[0].detail}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
