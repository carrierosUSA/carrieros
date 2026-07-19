"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAiSafety } from "@/components/ai-safety/AiSafetyProvider";
import { alphIntentToActionKind } from "@/lib/ai-safety";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  actOnAlert,
  dismissAlert,
  getCopilotCommand,
  runCopilotCommand,
  pushCommandResult,
  snoozeAlert,
  type CopilotAlert,
  type CopilotRole,
} from "@/lib/alph-copilot";

type ProactiveFeedProps = {
  alerts: CopilotAlert[];
  role: CopilotRole;
  onChange: () => void;
};

function severityTone(severity: CopilotAlert["severity"]) {
  if (severity === "critical") return TRANSPO_COLORS.critical;
  if (severity === "warning") return TRANSPO_COLORS.warning;
  if (severity === "success") return TRANSPO_COLORS.success;
  return TRANSPO_COLORS.info;
}

export default function ProactiveFeed({
  alerts,
  role,
  onChange,
}: ProactiveFeedProps) {
  const router = useRouter();
  const { runAiSuggestedAction } = useAiSafety();

  function handleAction(alert: CopilotAlert, actionHref?: string, commandId?: string) {
    actOnAlert(alert.id);
    onChange();

    if (commandId && commandId !== "snooze") {
      const cmd = getCopilotCommand(commandId);
      if (cmd?.risk === "confirm") {
        void runAiSuggestedAction({
          kind: alphIntentToActionKind(cmd.id),
          suggestion: cmd.label,
          confidence: "review_recommended",
          reason: cmd.description,
          dataUsed: ["Alph Copilot™ proactive alert", alert.title],
          source: "alph-copilot-proactive",
          onConfirm: () => {
            const result = runCopilotCommand(commandId, {
              role,
              byId: true,
              confirmed: true,
              skipAudit: true,
            });
            if (!("needsConfirm" in result)) {
              pushCommandResult(result);
              if (result.href) router.push(result.href);
            }
          },
        });
        return;
      }

      const result = runCopilotCommand(commandId, {
        role,
        byId: true,
        confirmed: true,
      });
      if (!("needsConfirm" in result)) {
        pushCommandResult(result);
        if (result.href) router.push(result.href);
      }
      return;
    }

    if (actionHref) {
      router.push(actionHref);
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-[16px] bg-[#F8FAFC] px-4 py-6 text-center">
        <p className="text-[15px] font-semibold text-[#111827]">
          You&apos;re clear for now
        </p>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Alph will surface the next thing that needs attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const tone = severityTone(alert.severity);
        return (
          <article
            key={alert.id}
            className="rounded-[16px] bg-white px-4 py-4 shadow-[inset_0_0_0_1px_#EAEAEA]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-[#111827]">
                    {alert.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone.bg} ${tone.text}`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#6B7280]">
                  {alert.body}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {alert.actions.map((action) => {
                if (action.commandId === "snooze") {
                  return (
                    <button
                      key={`${alert.id}-snooze`}
                      type="button"
                      onClick={() => {
                        snoozeAlert(alert.id, 1);
                        onChange();
                      }}
                      className="rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    >
                      {action.label}
                    </button>
                  );
                }

                if (action.commandId) {
                  return (
                    <button
                      key={`${alert.id}-${action.commandId}`}
                      type="button"
                      onClick={() =>
                        handleAction(alert, action.href, action.commandId)
                      }
                      className={
                        action.primary
                          ? "rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white"
                          : "rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-semibold text-[#475569]"
                      }
                    >
                      {action.label}
                    </button>
                  );
                }

                if (action.href) {
                  return (
                    <button
                      key={`${alert.id}-${action.href}`}
                      type="button"
                      onClick={() => handleAction(alert, action.href)}
                      className={
                        action.primary
                          ? "rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white"
                          : "rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-semibold text-[#475569]"
                      }
                    >
                      {action.label}
                    </button>
                  );
                }

                return null;
              })}
              <button
                type="button"
                onClick={() => {
                  dismissAlert(alert.id);
                  onChange();
                }}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#94A3B8] hover:text-[#64748B]"
              >
                Dismiss
              </button>
              {!alert.actions.some((a) => a.commandId === "snooze") ? (
                <button
                  type="button"
                  onClick={() => {
                    snoozeAlert(alert.id, 1);
                    onChange();
                  }}
                  className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#94A3B8] hover:text-[#64748B]"
                >
                  Snooze
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
      <p className="text-[12px] text-[#94A3B8]">
        Proactive feed ·{" "}
        <Link href="/notifications" className="font-semibold text-[#2563EB]">
          Notification center
        </Link>
      </p>
    </div>
  );
}
