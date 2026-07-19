import type { DocumentHealthSnapshot } from "@/lib/documents/types";
import type { Load } from "@/lib/types";

export type DocumentHealthDriverStat = {
  driverId: string;
  driverName: string;
  missingCount: number;
  criticalLoads: number;
};

export type DocumentHealthBrokerStat = {
  brokerId: string;
  brokerName: string;
  missingCount: number;
  criticalLoads: number;
};

export type DocumentHealthAnalytics = {
  missingDocumentsToday: number;
  loadsWaitingOnPod: number;
  loadsReadyToInvoice: number;
  averageUploadTimeHours: number;
  criticalLoads: number;
  warningLoads: number;
  completeLoads: number;
  byDriver: DocumentHealthDriverStat[];
  byBroker: DocumentHealthBrokerStat[];
};

type NameLookup = {
  drivers: Record<string, string>;
  brokers: Record<string, string>;
};

/**
 * Aggregate dashboard metrics from health snapshots.
 * Average upload time is heuristic until real capture timestamps are complete.
 */
export function buildDocumentHealthAnalytics(
  snapshots: DocumentHealthSnapshot[],
  loads: Load[],
  names: NameLookup,
): DocumentHealthAnalytics {
  const loadById = new Map(loads.map((load) => [load.id, load]));

  let missingDocumentsToday = 0;
  let loadsWaitingOnPod = 0;
  let loadsReadyToInvoice = 0;
  let criticalLoads = 0;
  let warningLoads = 0;
  let completeLoads = 0;

  const driverMissing = new Map<string, { missing: number; critical: number }>();
  const brokerMissing = new Map<string, { missing: number; critical: number }>();

  for (const snapshot of snapshots) {
    missingDocumentsToday += snapshot.missingRequiredCount;

    if (snapshot.score.level === "critical") {
      criticalLoads += 1;
    } else if (snapshot.score.level === "warning") {
      warningLoads += 1;
    } else {
      completeLoads += 1;
    }

    if (snapshot.readyToInvoice) {
      loadsReadyToInvoice += 1;
    }

    const waitingPod = snapshot.issues.some(
      (issue) =>
        issue.documentKind === "pod" &&
        (issue.kind === "missing" ||
          issue.kind === "empty_page" ||
          issue.kind === "missing_signature"),
    );
    if (waitingPod) {
      loadsWaitingOnPod += 1;
    }

    const load = loadById.get(snapshot.loadId);
    if (load?.driverId && snapshot.missingRequiredCount > 0) {
      const current = driverMissing.get(load.driverId) ?? {
        missing: 0,
        critical: 0,
      };
      current.missing += snapshot.missingRequiredCount;
      if (snapshot.score.level === "critical") {
        current.critical += 1;
      }
      driverMissing.set(load.driverId, current);
    }

    if (load?.brokerId && snapshot.missingRequiredCount > 0) {
      const current = brokerMissing.get(load.brokerId) ?? {
        missing: 0,
        critical: 0,
      };
      current.missing += snapshot.missingRequiredCount;
      if (snapshot.score.level === "critical") {
        current.critical += 1;
      }
      brokerMissing.set(load.brokerId, current);
    }
  }

  // Heuristic: blend captured timeline events into a mock average upload lag
  const uploadHours =
    snapshots.length === 0
      ? 0
      : snapshots.reduce((sum, snapshot) => {
          const uploads = snapshot.timeline.filter(
            (event) => event.type === "uploaded" || event.type === "reuploaded",
          ).length;
          return sum + (uploads > 0 ? 4.5 : 11);
        }, 0) / snapshots.length;

  const byDriver: DocumentHealthDriverStat[] = [...driverMissing.entries()]
    .map(([driverId, stats]) => ({
      driverId,
      driverName: names.drivers[driverId] ?? driverId,
      missingCount: stats.missing,
      criticalLoads: stats.critical,
    }))
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 8);

  const byBroker: DocumentHealthBrokerStat[] = [...brokerMissing.entries()]
    .map(([brokerId, stats]) => ({
      brokerId,
      brokerName: names.brokers[brokerId] ?? brokerId,
      missingCount: stats.missing,
      criticalLoads: stats.critical,
    }))
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 8);

  return {
    missingDocumentsToday,
    loadsWaitingOnPod,
    loadsReadyToInvoice,
    averageUploadTimeHours: Math.round(uploadHours * 10) / 10,
    criticalLoads,
    warningLoads,
    completeLoads,
    byDriver,
    byBroker,
  };
}
