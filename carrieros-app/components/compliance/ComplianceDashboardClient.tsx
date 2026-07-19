"use client";

import { useMemo, useState } from "react";
import ComplianceAlphAlertsStrip from "@/components/compliance/ComplianceAlphAlertsStrip";
import ComplianceDashboardStats from "@/components/compliance/ComplianceDashboardStats";
import ComplianceIntegrationsStrip from "@/components/compliance/ComplianceIntegrationsStrip";
import ComplianceQuickActions from "@/components/compliance/ComplianceQuickActions";
import ComplianceReportsPanel from "@/components/compliance/ComplianceReportsPanel";
import ComplianceSubNav, {
  parseComplianceTab,
} from "@/components/compliance/ComplianceSubNav";
import ComplianceTimeline from "@/components/compliance/ComplianceTimeline";
import {
  AccidentsPanel,
  ClaimsPanel,
  DotInspectionsPanel,
  DriverCompliancePanel,
  DrugAlcoholPanel,
  TrailerCompliancePanel,
  TrainingPanel,
  TruckCompliancePanel,
} from "@/components/compliance/ComplianceTabPanels";
import ReportAccidentModal from "@/components/compliance/ReportAccidentModal";
import FadeIn from "@/components/ui/FadeIn";
import { addAccident } from "@/lib/data/compliance-store";
import type {
  AccidentDraftInput,
  AccidentRecord,
  ClaimRecord,
  ComplianceAlert,
  ComplianceAlphPrediction,
  ComplianceDashboardStats as Stats,
  ComplianceReportCard,
  ComplianceTimelineEvent,
  DotInspection,
  DriverComplianceItem,
  DrugAlcoholRecord,
  SafetyTrainingRecord,
  TrailerComplianceItem,
  TruckComplianceItem,
} from "@/lib/types/compliance";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceDashboardClientProps = {
  tenantId: string;
  stats: Stats;
  predictions: ComplianceAlphPrediction[];
  alerts: ComplianceAlert[];
  timeline: ComplianceTimelineEvent[];
  reports: ComplianceReportCard[];
  drivers: DriverComplianceItem[];
  trucks: TruckComplianceItem[];
  trailers: TrailerComplianceItem[];
  inspections: DotInspection[];
  accidents: AccidentRecord[];
  claims: ClaimRecord[];
  drugAlcohol: DrugAlcoholRecord[];
  training: SafetyTrainingRecord[];
  driverOptions: { id: string; name: string }[];
  truckOptions: { id: string; unitNumber: string }[];
  trailerOptions: { id: string; unitNumber: string }[];
};

export default function ComplianceDashboardClient({
  tenantId,
  stats,
  predictions,
  alerts,
  timeline,
  reports,
  drivers,
  trucks,
  trailers,
  inspections,
  accidents: initialAccidents,
  claims,
  drugAlcohol,
  training,
  driverOptions,
  truckOptions,
  trailerOptions,
}: ComplianceDashboardClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = parseComplianceTab(searchParams.get("tab") ?? undefined);

  const [accidents, setAccidents] = useState(initialAccidents);
  const [timelineEvents, setTimelineEvents] = useState(timeline);
  const [accidentOpen, setAccidentOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const liveStats = useMemo(() => {
    const openAccidents = accidents.filter((a) => a.status !== "closed").length;
    return { ...stats, openAccidents };
  }, [stats, accidents]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function goTab(tab: string) {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }

  function handleAccidentSubmit(input: AccidentDraftInput) {
    const record = addAccident(tenantId, input);
    setAccidents((prev) => [record, ...prev]);
    setTimelineEvents((prev) => [
      {
        tenantId,
        id: `ctl-acc-${record.id}`,
        label: "Accident reported",
        detail: `${record.driverName} · ${record.location}`,
        occurredAt: new Date().toISOString(),
        category: "accident" as const,
        entityLabel: record.truckUnit
          ? `Unit ${record.truckUnit}`
          : record.driverName,
        href: "/compliance?tab=accidents",
      },
      ...prev,
    ]);
    showToast("Accident recorded");
    goTab("accidents");
  }

  return (
    <FadeIn className="space-y-6">
      <ComplianceDashboardStats stats={liveStats} />

      <ComplianceQuickActions
        onReportAccident={() => setAccidentOpen(true)}
        onUploadInspection={() => {
          showToast("Inspection upload ready — attach files in Documents");
          goTab("inspections");
        }}
        onScheduleDrugTest={() => {
          showToast("Open Drug & Alcohol to schedule a test");
          goTab("drug_alcohol");
        }}
        onAssignTraining={() => {
          showToast("Open Training to assign a course");
          goTab("training");
        }}
        onUploadDocuments={() => {
          showToast("Opening documents center");
          router.push("/documents");
        }}
      />

      {toast ? (
        <div
          className={`rounded-[12px] px-4 py-2 text-[13px] font-semibold ${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text}`}
        >
          {toast}
        </div>
      ) : null}

      {activeTab === "overview" ? (
        <ComplianceAlphAlertsStrip
          predictions={predictions}
          alerts={alerts}
        />
      ) : null}

      <ComplianceSubNav activeTab={activeTab} />

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ComplianceTimeline events={timelineEvents} />
          <div className="space-y-6">
            <ComplianceIntegrationsStrip tenantId={tenantId} />
            <ComplianceReportsPanel reports={reports} />
          </div>
        </div>
      ) : null}

      {activeTab === "drivers" ? (
        <DriverCompliancePanel items={drivers} />
      ) : null}
      {activeTab === "trucks" ? <TruckCompliancePanel items={trucks} /> : null}
      {activeTab === "trailers" ? (
        <TrailerCompliancePanel items={trailers} />
      ) : null}
      {activeTab === "inspections" ? (
        <DotInspectionsPanel inspections={inspections} />
      ) : null}
      {activeTab === "accidents" ? (
        <AccidentsPanel accidents={accidents} />
      ) : null}
      {activeTab === "claims" ? <ClaimsPanel claims={claims} /> : null}
      {activeTab === "drug_alcohol" ? (
        <DrugAlcoholPanel records={drugAlcohol} />
      ) : null}
      {activeTab === "training" ? (
        <TrainingPanel records={training} />
      ) : null}
      {activeTab === "reports" ? (
        <ComplianceReportsPanel reports={reports} />
      ) : null}

      <ReportAccidentModal
        open={accidentOpen}
        onClose={() => setAccidentOpen(false)}
        drivers={driverOptions}
        trucks={truckOptions}
        trailers={trailerOptions}
        onSubmit={handleAccidentSubmit}
      />
    </FadeIn>
  );
}
