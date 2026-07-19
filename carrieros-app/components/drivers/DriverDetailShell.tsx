import Link from "next/link";
import { Suspense } from "react";
import DriverAlphAlertsStrip from "@/components/drivers/DriverAlphAlertsStrip";
import DriverDetailTabs, {
  type DriverDetailTab,
} from "@/components/drivers/DriverDetailTabs";
import DriverOperationalBadge from "@/components/drivers/DriverOperationalBadge";
import DriverQuickActions from "@/components/drivers/DriverQuickActions";
import DriverAssignedLoadsTab from "@/components/drivers/tabs/DriverAssignedLoadsTab";
import DriverDocumentsTab from "@/components/drivers/tabs/DriverDocumentsTab";
import DriverNotesTab from "@/components/drivers/tabs/DriverNotesTab";
import DriverOverviewTab from "@/components/drivers/tabs/DriverOverviewTab";
import DriverPayrollTab from "@/components/drivers/tabs/DriverPayrollTab";
import DriverSafetyTab from "@/components/drivers/tabs/DriverSafetyTab";
import DriverTimelineTab from "@/components/drivers/tabs/DriverTimelineTab";
import DriverViolationsTab from "@/components/drivers/tabs/DriverViolationsTab";
import FadeIn from "@/components/ui/FadeIn";
import Skeleton from "@/components/ui/Skeleton";
import { detectDriverAlphAlerts } from "@/lib/drivers/driver-alph-alerts";
import { detectDriverAlerts } from "@/lib/drivers/driver-alerts";
import { getDriverOperationalStatus } from "@/lib/drivers/driver-board";
import type {
  Driver,
  DriverDocument,
  DriverNote,
  DriverPayrollRecord,
  DriverPerformanceMetric,
  DriverSafetyEvent,
  DriverTimelineEvent,
  DriverViolation,
  Load,
} from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverDetailShellProps = {
  driver: Driver;
  loads: Load[];
  assignedLoads: Load[];
  payroll: DriverPayrollRecord[];
  documents: DriverDocument[];
  safetyEvents: DriverSafetyEvent[];
  violations: DriverViolation[];
  notes: DriverNote[];
  timeline: DriverTimelineEvent[];
  performance: DriverPerformanceMetric[];
  activeTab: DriverDetailTab;
};

export default function DriverDetailShell({
  driver,
  loads,
  assignedLoads,
  payroll,
  documents,
  safetyEvents,
  violations,
  notes,
  timeline,
  performance,
  activeTab,
}: DriverDetailShellProps) {
  const operationalStatus = getDriverOperationalStatus(driver, loads);
  const alerts = detectDriverAlerts(driver);
  const alphAlerts = detectDriverAlphAlerts(driver, loads);

  return (
    <div className="w-full text-[#111827]">
      <header className="mb-4 border-b border-[#E5E7EB] pb-4">
        <Link
          href="/drivers"
          className="text-[13px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          ← All Drivers
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            {driver.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={driver.photoUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[20px] font-bold text-[#2563EB]">
                {driver.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-bold tracking-tight text-slate-950">
                  {driver.name}
                </h1>
                <DriverOperationalBadge status={operationalStatus} />
              </div>
              <p className="mt-1 text-[14px] text-slate-500">
                {driver.role} · {driver.homeTerminal ?? driver.location}
              </p>
              {alerts.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {alerts.map((alert) => (
                    <span
                      key={alert.id}
                      className={`inline-flex h-7 items-center rounded-md px-2 text-[12px] font-semibold ring-1 ${
                        alert.severity === "critical"
                          ? `${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.text} ${CARRIEROS_COLORS.critical.border}`
                          : `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text} ${CARRIEROS_COLORS.warning.border}`
                      }`}
                    >
                      {alert.label}: {alert.detail}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <DriverQuickActions driver={driver} />
        </div>
      </header>

      <div className="mb-4">
        <DriverAlphAlertsStrip alerts={alphAlerts} driver={driver} />
      </div>

      <Suspense fallback={<Skeleton className="h-11 w-full rounded-[14px]" />}>
        <DriverDetailTabs driverId={driver.id} activeTab={activeTab} />
      </Suspense>

      <FadeIn className="mt-4">
        {activeTab === "overview" ? (
          <DriverOverviewTab
            driver={driver}
            performance={performance}
            operationalStatus={operationalStatus}
          />
        ) : null}
        {activeTab === "loads" ? (
          <DriverAssignedLoadsTab loads={assignedLoads} />
        ) : null}
        {activeTab === "payroll" ? (
          <DriverPayrollTab driver={driver} payroll={payroll} />
        ) : null}
        {activeTab === "documents" ? (
          <DriverDocumentsTab driverId={driver.id} documents={documents} />
        ) : null}
        {activeTab === "safety" ? (
          <DriverSafetyTab events={safetyEvents} />
        ) : null}
        {activeTab === "violations" ? (
          <DriverViolationsTab violations={violations} />
        ) : null}
        {activeTab === "notes" ? (
          <DriverNotesTab notes={notes} />
        ) : null}
        {activeTab === "timeline" ? (
          <DriverTimelineTab events={timeline} />
        ) : null}
      </FadeIn>
    </div>
  );
}

export { parseDriverTab } from "@/components/drivers/DriverDetailTabs";
