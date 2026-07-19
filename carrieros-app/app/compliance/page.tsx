import { Suspense } from "react";
import ComplianceDashboardClient from "@/components/compliance/ComplianceDashboardClient";
import ComplianceDashboardSkeleton from "@/components/compliance/ComplianceDashboardSkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import {
  detectComplianceAlerts,
  detectComplianceAlphPredictions,
} from "@/lib/compliance/compliance-alph";
import { buildComplianceDashboardStats } from "@/lib/compliance/compliance-board";
import {
  listAccidents,
  listClaims,
  listComplianceReports,
  listComplianceTimeline,
  listDotInspections,
  listDriverCompliance,
  listDrugAlcohol,
  listTrailerCompliance,
  listTraining,
  listTruckCompliance,
} from "@/lib/data/compliance-store";
import { seedDrivers } from "@/lib/data/driver-store";
import { seedTrailers, seedTrucks } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function CompliancePage() {
  const tenantId = getActiveTenantId();
  const stats = buildComplianceDashboardStats(tenantId);
  const predictions = detectComplianceAlphPredictions(tenantId);
  const alerts = detectComplianceAlerts(tenantId);
  const timeline = listComplianceTimeline(tenantId);
  const reports = listComplianceReports();
  const drivers = listDriverCompliance(tenantId);
  const trucks = listTruckCompliance(tenantId);
  const trailers = listTrailerCompliance(tenantId);
  const inspections = listDotInspections(tenantId);
  const accidents = listAccidents(tenantId);
  const claims = listClaims(tenantId);
  const drugAlcohol = listDrugAlcohol(tenantId);
  const training = listTraining(tenantId);

  const driverOptions = seedDrivers
    .filter((d) => d.tenantId === tenantId)
    .map((d) => ({ id: d.id, name: d.name }));
  const truckOptions = seedTrucks
    .filter((t) => t.tenantId === tenantId)
    .map((t) => ({ id: t.id, unitNumber: t.unitNumber }));
  const trailerOptions = seedTrailers
    .filter((t) => t.tenantId === tenantId)
    .map((t) => ({ id: t.id, unitNumber: t.unitNumber }));

  return (
    <OperationalPageShell
      title="Safety & Compliance"
      subtitle="Keep every driver, truck, trailer, and company compliant — automatically."
      eyebrow="Safety / Compliance"
    >
      <Suspense fallback={<ComplianceDashboardSkeleton />}>
        <ComplianceDashboardClient
          tenantId={tenantId}
          stats={stats}
          predictions={predictions}
          alerts={alerts}
          timeline={timeline}
          reports={reports}
          drivers={drivers}
          trucks={trucks}
          trailers={trailers}
          inspections={inspections}
          accidents={accidents}
          claims={claims}
          drugAlcohol={drugAlcohol}
          training={training}
          driverOptions={driverOptions}
          truckOptions={truckOptions}
          trailerOptions={trailerOptions}
        />
      </Suspense>
    </OperationalPageShell>
  );
}
