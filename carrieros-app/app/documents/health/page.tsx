import Link from "next/link";
import DocumentHealthDashboardClient from "@/components/documents/DocumentHealthDashboardClient";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { getBrokerById } from "@/lib/data/brokers";
import { getDriverById } from "@/lib/data/drivers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { buildDocumentHealthAnalytics } from "@/lib/documents/document-health-analytics";
import { computeDocumentHealthForLoads } from "@/lib/documents/document-health";
import { getPendingRequests } from "@/lib/documents/document-health-store";
import { getLoadService } from "@/lib/services/loads";

export default async function DocumentHealthPage() {
  const tenantId = getActiveTenantId();
  const loads = await getLoadService().listLoads(tenantId);
  const snapshots = computeDocumentHealthForLoads(loads);

  const driverNames: Record<string, string> = {};
  const brokerNames: Record<string, string> = {};

  for (const load of loads) {
    if (load.driverId && !driverNames[load.driverId]) {
      driverNames[load.driverId] =
        getDriverById(load.driverId)?.name ?? load.driverId;
    }
    if (load.brokerId && !brokerNames[load.brokerId]) {
      brokerNames[load.brokerId] =
        getBrokerById(load.brokerId)?.name ?? load.brokerId;
    }
  }

  const analytics = buildDocumentHealthAnalytics(snapshots, loads, {
    drivers: driverNames,
    brokers: brokerNames,
  });
  const requests = getPendingRequests();

  return (
    <OperationalPageShell
      title="Document Health"
      subtitle="Alph monitors every load for missing, incomplete, or expired documents."
      eyebrow="Document Operations"
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/documents/requests"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#E2E8F0] transition hover:bg-slate-50"
          >
            Requests
          </Link>
          <Link
            href="/documents"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Document Center
          </Link>
        </div>
      }
    >
      <DocumentHealthDashboardClient
        snapshots={snapshots}
        analytics={analytics}
        requests={requests}
      />
    </OperationalPageShell>
  );
}
