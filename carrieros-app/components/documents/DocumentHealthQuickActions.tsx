"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  markIssueException,
  markIssueIgnored,
  recordDocumentRequest,
} from "@/lib/documents/document-health-store";
import type { DocumentIssue, DocumentQuickAction } from "@/lib/documents/types";
import {
  buildMailtoUrl,
  buildSmsUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";

type DocumentHealthQuickActionsProps = {
  loadId: string;
  loadReference: string;
  issue: DocumentIssue;
  driverPhone?: string;
  brokerEmail?: string;
  compact?: boolean;
  onActionComplete?: () => void;
};

const ACTION_LABELS: Record<DocumentQuickAction, string> = {
  uploadNow: "Upload Now",
  takePhoto: "Take Photo",
  requestFromDriver: "Request From Driver",
  requestFromBroker: "Request From Broker",
  markAsException: "Mark as Exception",
  ignore: "Ignore",
};

export default function DocumentHealthQuickActions({
  loadId,
  loadReference,
  issue,
  driverPhone,
  brokerEmail,
  compact = false,
  onActionComplete,
}: DocumentHealthQuickActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<DocumentQuickAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const actions: DocumentQuickAction[] = compact
    ? [issue.primaryAction, "markAsException", "ignore"]
    : [
        "uploadNow",
        "takePhoto",
        "requestFromDriver",
        "requestFromBroker",
        "markAsException",
        "ignore",
      ];

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function run(action: DocumentQuickAction) {
    setBusy(action);

    switch (action) {
      case "uploadNow":
      case "takePhoto":
        router.push(`/loads/${loadId}/documents`);
        break;
      case "requestFromDriver": {
        recordDocumentRequest({
          loadId,
          loadReference,
          target: "driver",
          documentKind: issue.documentKind,
          requestedBy: "Dispatcher",
          channel: driverPhone ? "sms" : "push",
          note: issue.message,
        });
        if (driverPhone) {
          const sms = buildSmsUrl(
            driverPhone,
            `Please upload ${issue.documentKind.replaceAll("_", " ")} for ${loadReference}.`,
          );
          if (sms) {
            openCommunicationUrl(sms);
          }
        }
        flash("Requested from driver — timeline updated");
        break;
      }
      case "requestFromBroker": {
        recordDocumentRequest({
          loadId,
          loadReference,
          target: "broker",
          documentKind: issue.documentKind,
          requestedBy: "Dispatcher",
          channel: brokerEmail ? "email" : "portal",
          note: issue.message,
        });
        if (brokerEmail) {
          const mail = buildMailtoUrl(
            brokerEmail,
            `${loadReference}: ${issue.documentKind.replaceAll("_", " ")} needed`,
            `Hi — we still need ${issue.documentKind.replaceAll("_", " ")} for load ${loadReference}. Please upload when you can.`,
          );
          if (mail) {
            openCommunicationUrl(mail);
          }
        }
        flash("Requested from broker — timeline updated");
        break;
      }
      case "markAsException":
        markIssueException(loadId, issue.kind, issue.documentKind);
        flash("Marked as exception");
        break;
      case "ignore":
        markIssueIgnored(loadId, issue.kind, issue.documentKind);
        flash("Issue ignored");
        break;
      default:
        break;
    }

    setBusy(null);
    onActionComplete?.();
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const primary = action === issue.primaryAction;
          return (
            <button
              key={action}
              type="button"
              disabled={busy === action}
              onClick={() => run(action)}
              className={
                primary
                  ? "inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
                  : "inline-flex h-9 items-center justify-center rounded-full bg-[#F8FAFC] px-3 text-[13px] font-medium text-slate-700 transition hover:bg-[#F1F5F9] disabled:opacity-60"
              }
            >
              {ACTION_LABELS[action]}
            </button>
          );
        })}
      </div>
      {toast ? (
        <p className="text-[13px] font-medium text-[#16A34A]">{toast}</p>
      ) : null}
    </div>
  );
}
