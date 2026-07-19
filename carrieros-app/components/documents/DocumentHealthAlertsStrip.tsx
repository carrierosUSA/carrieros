"use client";

import DocumentHealthQuickActions from "@/components/documents/DocumentHealthQuickActions";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { DocumentHealthSnapshot } from "@/lib/documents/types";

type DocumentHealthAlertsStripProps = {
  snapshot: DocumentHealthSnapshot;
  driverPhone?: string;
  brokerEmail?: string;
  title?: string;
  maxIssues?: number;
};

export default function DocumentHealthAlertsStrip({
  snapshot,
  driverPhone,
  brokerEmail,
  title = "Alph document alerts",
  maxIssues = 4,
}: DocumentHealthAlertsStripProps) {
  const issues = snapshot.issues.slice(0, maxIssues);

  if (issues.length === 0) {
    return (
      <section className="rounded-[14px] bg-[#ECFDF3] px-4 py-3">
        <p className="text-[14px] font-semibold text-[#166534]">
          Document health complete
        </p>
        <p className="text-[13px] text-[#15803D]">
          Alph is monitoring required documents for this load.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Alph document alerts"
      className="rounded-[14px] bg-[#FFF7ED] p-4"
    >
      <div className="mb-3">
        <p className="text-[14px] font-bold text-[#9A3412]">{title}</p>
        <p className="text-[13px] font-medium text-[#C2410C]">
          {snapshot.criticalCount} critical · {snapshot.warningCount} warning
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {issues.map((issue) => {
          const colors =
            issue.severity === "critical"
              ? CARRIEROS_COLORS.critical
              : CARRIEROS_COLORS.warning;

          return (
            <div
              key={issue.id}
              className="rounded-[12px] bg-white px-3 py-3 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-start gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors.bg} ${colors.text}`}
                >
                  {issue.severity === "critical" ? "Critical" : "Warning"}
                </span>
                <p className="min-w-0 flex-1 text-[14px] font-semibold text-slate-900">
                  {issue.message}
                </p>
              </div>
              <DocumentHealthQuickActions
                loadId={snapshot.loadId}
                loadReference={snapshot.loadReference}
                issue={issue}
                driverPhone={driverPhone}
                brokerEmail={brokerEmail}
                compact
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
