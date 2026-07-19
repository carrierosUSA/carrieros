import { CheckCircle2, SkipForward, XCircle } from "lucide-react";
import { getActionLabel, getTriggerLabel } from "@/lib/workflows/catalog";
import type { WorkflowRun } from "@/lib/workflows/types";

type WorkflowRunHistoryProps = {
  runs: WorkflowRun[];
  emptyLabel?: string;
};

function StatusIcon({ status }: { status: WorkflowRun["status"] }) {
  if (status === "success") {
    return <CheckCircle2 className="h-4 w-4 text-[#16A34A]" strokeWidth={2} />;
  }
  if (status === "skipped") {
    return <SkipForward className="h-4 w-4 text-[#F59E0B]" strokeWidth={2} />;
  }
  return <XCircle className="h-4 w-4 text-[#DC2626]" strokeWidth={2} />;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WorkflowRunHistory({
  runs,
  emptyLabel = "No runs yet. Use Test run to simulate execution.",
}: WorkflowRunHistoryProps) {
  if (runs.length === 0) {
    return (
      <div className="rounded-[16px] bg-[#F8FAFC] px-5 py-10 text-center">
        <p className="text-[14px] font-medium text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {runs.map((run) => (
        <li
          key={run.id}
          className="rounded-[16px] bg-white px-4 py-4 ring-1 ring-[#EEF2F7]"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <StatusIcon status={run.status} />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-semibold text-slate-900">
                  {run.status === "success"
                    ? "Completed"
                    : run.status === "skipped"
                      ? "Skipped"
                      : "Failed"}
                </p>
                <span className="text-[12px] font-medium text-slate-400">
                  {formatTime(run.triggeredAt)}
                </span>
                <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                  {getTriggerLabel(run.triggerType)}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600">
                {run.summary}
              </p>
              {run.logs.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-[#F1F5F9] pt-2">
                  {run.logs.map((log) => (
                    <li
                      key={`${run.id}-${log.actionId}`}
                      className="text-[12px] text-slate-500"
                    >
                      <span
                        className={
                          log.ok
                            ? "font-semibold text-slate-700"
                            : "font-semibold text-[#DC2626]"
                        }
                      >
                        {getActionLabel(log.actionType)}
                      </span>
                      {" — "}
                      {log.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
