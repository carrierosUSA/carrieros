"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Star } from "lucide-react";
import { useCallback } from "react";
import { useLoadDetailQuickTasks } from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";
import { useLoadDetailCommunication } from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationProvider";
import type { AlphFixAction, AlphIssue } from "@/lib/dispatch/alph-issues";

type UseAlphIssueActionsOptions = {
  loadId: string;
  driverPhone?: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

export function useAlphIssueActions({
  loadId,
  driverPhone,
  trackingEnabled,
  hasDriver,
}: UseAlphIssueActionsOptions) {
  const router = useRouter();
  const { call, message } = useLoadDetailCommunication();
  const { openTask } = useLoadDetailQuickTasks();

  const trackingHref = `/loads/${loadId}/tracking`;
  const trackingAvailable = trackingEnabled && hasDriver;
  const hasDriverPhone = Boolean(driverPhone && driverPhone !== "—");

  const fixIssue = useCallback(
    (action: AlphFixAction) => {
      switch (action) {
        case "callDriver":
          if (hasDriverPhone && driverPhone) {
            call(driverPhone);
          }
          return;
        case "messageDriver":
          if (hasDriverPhone && driverPhone) {
            message(driverPhone);
          }
          return;
        case "openTracking":
          if (trackingAvailable) {
            router.push(trackingHref);
          }
          return;
        case "requestPod":
          openTask("requestPod");
          return;
        case "emailBroker":
          openTask("notifyBroker");
          return;
        case "uploadDocument":
          router.push(`/loads/${loadId}/documents`);
          return;
        case "requestFromDriver":
          openTask("requestPod");
          return;
        case "requestFromBroker":
          openTask("notifyBroker");
          return;
        case "markException":
        case "ignoreIssue":
          // Handled by Document Health quick actions; no-op in strip
          return;
        default:
          return;
      }
    },
    [
      call,
      driverPhone,
      hasDriverPhone,
      message,
      openTask,
      router,
      trackingAvailable,
      trackingHref,
    ],
  );

  return { fixIssue };
}

export function IssueSeverityIcon({
  severity,
}: {
  severity: AlphIssue["severity"];
}) {
  const styles =
    severity === "critical"
      ? "bg-[#FEF2F2] text-[#DC2626] ring-[#FECACA]"
      : "bg-[#FFF7ED] text-[#EA580C] ring-[#FED7AA]";

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${styles}`}
    >
      <AlertTriangle className="h-4 w-4" strokeWidth={2.25} aria-hidden />
    </span>
  );
}

export function AlphMonitoringOk() {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#BBF7D0] bg-[#ECFDF3] px-4 py-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#16A34A] ring-1 ring-[#BBF7D0]">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-[#166534]">No issues detected</p>
        <p className="text-[13px] text-[#15803D]">Alph is monitoring this load.</p>
      </div>
    </div>
  );
}

export function GlowingStarIcon() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <span
        className="absolute inset-0 rounded-full bg-blue-400/30 blur-[3px]"
        aria-hidden
      />
      <Star
        className="relative h-3.5 w-3.5 fill-blue-500 text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.75)]"
        aria-hidden
      />
    </span>
  );
}
