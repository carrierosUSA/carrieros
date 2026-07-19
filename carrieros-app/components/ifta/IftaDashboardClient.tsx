"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import IftaAlphAlertsStrip from "@/components/ifta/IftaAlphAlertsStrip";
import IftaDashboardStats from "@/components/ifta/IftaDashboardStats";
import IftaExportPanel from "@/components/ifta/IftaExportPanel";
import IftaFeedbackToast from "@/components/ifta/IftaFeedbackToast";
import IftaFuelView from "@/components/ifta/IftaFuelView";
import IftaQuarterView from "@/components/ifta/IftaQuarterView";
import IftaQuickActions from "@/components/ifta/IftaQuickActions";
import IftaReportTimeline from "@/components/ifta/IftaReportTimeline";
import IftaStateView from "@/components/ifta/IftaStateView";
import IftaTabs, { parseIftaView } from "@/components/ifta/IftaTabs";
import IftaTruckDetailDrawer from "@/components/ifta/IftaTruckDetailDrawer";
import IftaTruckView from "@/components/ifta/IftaTruckView";
import { detectIftaAlphAlerts } from "@/lib/ifta/alph";
import {
  buildDashboardKpis,
  buildQuarterRows,
  buildStateRows,
  buildTruckRows,
  buildTruckStateBreakdown,
  listFuelForView,
  summarizeForPackage,
} from "@/lib/ifta/board";
import {
  buildPackageDownloadLines,
  downloadIftaCsv,
  downloadIftaPdfSummary,
  exportReportByKind,
} from "@/lib/ifta/export";
import { importEldMileage } from "@/lib/ifta/eld-import";
import {
  generateQuarterPackage,
  getCurrentQuarter,
  listIftaReports,
  recordReportDownload,
} from "@/lib/ifta/store";
import type {
  IftaAlphAlert,
  IftaGeneratedReport,
  IftaQuarterId,
  IftaReportKind,
  IftaView,
} from "@/lib/ifta/types";

type IftaDashboardClientProps = {
  initialView: IftaView;
  initialQuarter?: IftaQuarterId;
  initialYear?: number;
  readOnly?: boolean;
  actorName?: string;
};

type BoardSnapshot = {
  kpis: ReturnType<typeof buildDashboardKpis>;
  trucks: ReturnType<typeof buildTruckRows>;
  states: ReturnType<typeof buildStateRows>;
  quarters: ReturnType<typeof buildQuarterRows>;
  fuel: ReturnType<typeof listFuelForView>;
  reports: IftaGeneratedReport[];
  alerts: IftaAlphAlert[];
};

function loadSnapshot(
  quarter: IftaQuarterId,
  year: number,
): BoardSnapshot {
  return {
    kpis: buildDashboardKpis(quarter, year),
    trucks: buildTruckRows(quarter, year),
    states: buildStateRows(quarter, year),
    quarters: buildQuarterRows(year),
    fuel: listFuelForView(quarter, year),
    reports: listIftaReports(),
    alerts: detectIftaAlphAlerts(quarter, year),
  };
}

export default function IftaDashboardClient({
  initialView,
  initialQuarter,
  initialYear,
  readOnly = false,
  actorName = "Alpha Owner",
}: IftaDashboardClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const activeView = parseIftaView(searchParams.get("view") ?? initialView);

  const current = getCurrentQuarter();
  // Prefer Q2 for demo filing when in Q3 and no explicit selection yet
  const defaultQuarter: IftaQuarterId =
    initialQuarter ?? (current.quarter === "Q3" ? "Q2" : current.quarter);
  const defaultYear = initialYear ?? current.year;

  const [quarter, setQuarter] = useState<IftaQuarterId>(defaultQuarter);
  const [year] = useState(defaultYear);
  const [snapshot, setSnapshot] = useState<BoardSnapshot>(() =>
    loadSnapshot(defaultQuarter, defaultYear),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const refresh = useCallback(
    (q: IftaQuarterId = quarter, y: number = year) => {
      setSnapshot(loadSnapshot(q, y));
    },
    [quarter, year],
  );

  useEffect(() => {
    refresh(quarter, year);
  }, [quarter, year, refresh]);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
  }, []);

  const goToView = useCallback(
    (view: IftaView) => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === "trucks") params.delete("view");
      else params.set("view", view);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleAlphFix = useCallback(
    (alert: IftaAlphAlert) => {
      if (alert.fixAction === "generate") {
        goToView("export");
        return;
      }
      if (alert.fixAction === "truck_detail" && alert.relatedId) {
        setSelectedTruckId(alert.relatedId);
        goToView("trucks");
        return;
      }
      if (
        alert.fixAction === "fuel" ||
        alert.fixAction === "states" ||
        alert.fixAction === "trucks" ||
        alert.fixAction === "export" ||
        alert.fixAction === "quarters"
      ) {
        goToView(alert.fixAction);
      }
    },
    [goToView],
  );

  const handleGeneratePackage = useCallback(() => {
    if (readOnly) {
      showFeedback("Read-only: ask an owner to generate reports.");
      return;
    }
    const summary = summarizeForPackage(quarter, year);
    const report = generateQuarterPackage({
      quarter,
      year,
      generatedBy: actorName,
      summary,
    });
    // Also download the package PDF immediately
    const result = exportReportByKind("package", quarter, year);
    recordReportDownload(report.id, {
      format: result.format === "txt" ? "pdf" : result.format,
      filename: result.filename,
      downloadedAt: new Date().toISOString(),
      downloadedBy: actorName,
    });
    refresh();
    goToView("export");
    showFeedback(`${quarter} ${year} IFTA package generated and downloaded.`);
  }, [
    actorName,
    goToView,
    quarter,
    readOnly,
    refresh,
    showFeedback,
    year,
  ]);

  const handleExport = useCallback(
    (kind: IftaReportKind | "csv" | "xlsx" | "pdf") => {
      const result = exportReportByKind(kind, quarter, year);
      // Attach to latest matching package if present
      const latest = listIftaReports().find(
        (r) => r.quarter === quarter && r.year === year && r.kind === "package",
      );
      if (latest) {
        recordReportDownload(latest.id, {
          format:
            result.format === "txt"
              ? "pdf"
              : result.format === "xlsx"
                ? "xlsx"
                : result.format,
          filename: result.filename,
          downloadedAt: new Date().toISOString(),
          downloadedBy: actorName,
        });
        refresh();
      }
      showFeedback(`Downloaded ${result.filename}`);
    },
    [actorName, quarter, refresh, showFeedback, year],
  );

  const handleTimelineDownload = useCallback(
    (report: IftaGeneratedReport, format: "csv" | "pdf") => {
      if (format === "csv") {
        const filename = `${report.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
        downloadIftaCsv(
          filename,
          ["Metric", "Value"],
          [
            ["Quarter", `${report.quarter} ${report.year}`],
            ["Total Miles", String(report.summary.totalMiles)],
            ["Taxable Miles", String(report.summary.taxableMiles)],
            ["Gallons", String(report.summary.gallons)],
            ["MPG", String(report.summary.mpg)],
            ["Estimated Tax", String(report.summary.estimatedTax)],
            ["Missing Receipts", String(report.summary.missingReceipts)],
          ],
        );
        recordReportDownload(report.id, {
          format: "csv",
          filename,
          downloadedAt: new Date().toISOString(),
          downloadedBy: actorName,
        });
      } else {
        downloadIftaPdfSummary(report.title, buildPackageDownloadLines(report));
        const filename = `${report.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
        recordReportDownload(report.id, {
          format: "pdf",
          filename,
          downloadedAt: new Date().toISOString(),
          downloadedBy: actorName,
        });
      }
      refresh();
      showFeedback("Report download saved to timeline.");
    },
    [actorName, refresh, showFeedback],
  );

  const handleEldImport = useCallback(
    async (provider: "samsara" | "motive" | "geotab") => {
      const result = await importEldMileage({
        provider,
        fromDate: `${year}-01-01`,
        toDate: `${year}-12-31`,
      });
      showFeedback(result.message);
    },
    [showFeedback, year],
  );

  const selectedTruck = useMemo(
    () => snapshot.trucks.find((t) => t.truckId === selectedTruckId),
    [selectedTruckId, snapshot.trucks],
  );

  const truckBreakdown = useMemo(() => {
    if (!selectedTruckId) return [];
    return buildTruckStateBreakdown(selectedTruckId, quarter, year);
  }, [quarter, selectedTruckId, year]);

  const generateLabel =
    quarter === "Q2" ? "Generate Q2 IFTA" : `Generate ${quarter} IFTA`;

  return (
    <FadeIn>
      <div className="space-y-5">
        <IftaDashboardStats stats={snapshot.kpis} />

        <IftaQuickActions
          actions={[
            {
              id: "generate",
              label: generateLabel,
              primary: true,
              disabled: readOnly,
              title: readOnly
                ? "Accountants can download reports only"
                : `Build ${quarter} ${year} accountant package`,
              onClick: handleGeneratePackage,
            },
            {
              id: "export",
              label: "Accountant export",
              onClick: () => goToView("export"),
            },
            {
              id: "fuel",
              label: "Fuel purchases",
              onClick: () => goToView("fuel"),
            },
            {
              id: "q2",
              label: "View Q2",
              onClick: () => {
                setQuarter("Q2");
                goToView("quarters");
              },
            },
          ]}
        />

        <IftaAlphAlertsStrip
          alerts={snapshot.alerts}
          onFix={handleAlphFix}
        />

        <IftaTabs activeView={activeView} readOnly={readOnly} />

        {activeView === "trucks" ? (
          <IftaTruckView
            rows={snapshot.trucks}
            onSelectTruck={(id) => setSelectedTruckId(id)}
          />
        ) : null}

        {activeView === "states" ? (
          <IftaStateView rows={snapshot.states} />
        ) : null}

        {activeView === "quarters" ? (
          <IftaQuarterView
            rows={snapshot.quarters}
            selectedQuarter={quarter}
            onSelectQuarter={(q) => {
              setQuarter(q);
              showFeedback(`Showing ${q} ${year}`);
            }}
          />
        ) : null}

        {activeView === "fuel" ? (
          <IftaFuelView purchases={snapshot.fuel} />
        ) : null}

        {activeView === "export" ? (
          <div className="space-y-5">
            <IftaExportPanel
              quarter={quarter}
              year={year}
              readOnly={readOnly}
              onGeneratePackage={handleGeneratePackage}
              onExport={handleExport}
              onEldImport={handleEldImport}
            />
            <IftaReportTimeline
              reports={snapshot.reports}
              onDownload={handleTimelineDownload}
            />
          </div>
        ) : null}

        {activeView !== "export" && snapshot.reports.length > 0 ? (
          <IftaReportTimeline
            reports={snapshot.reports.slice(0, 3)}
            onDownload={handleTimelineDownload}
          />
        ) : null}
      </div>

      <IftaTruckDetailDrawer
        open={Boolean(selectedTruckId)}
        unitNumber={selectedTruck?.unitNumber ?? ""}
        breakdown={truckBreakdown}
        onClose={() => setSelectedTruckId(null)}
      />

      <IftaFeedbackToast
        message={feedback}
        onDismiss={() => setFeedback(null)}
      />
    </FadeIn>
  );
}
