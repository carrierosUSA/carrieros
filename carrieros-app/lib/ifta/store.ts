import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import type {
  IftaDownloadRecord,
  IftaFuelPurchase,
  IftaGeneratedReport,
  IftaQuarterId,
  IftaReportKind,
  IftaStoreState,
  IftaTripSegment,
  UsStateCode,
} from "./types";

const STORAGE_KEY = "carrieros.ifta.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function quarterFromDate(date: string): { quarter: IftaQuarterId; year: number } {
  const d = new Date(`${date}T12:00:00`);
  const month = d.getMonth();
  const year = d.getFullYear();
  if (month <= 2) return { quarter: "Q1", year };
  if (month <= 5) return { quarter: "Q2", year };
  if (month <= 8) return { quarter: "Q3", year };
  return { quarter: "Q4", year };
}

export function getCurrentQuarter(now = new Date()): {
  quarter: IftaQuarterId;
  year: number;
  label: string;
} {
  const month = now.getMonth();
  const year = now.getFullYear();
  let quarter: IftaQuarterId = "Q1";
  if (month <= 2) quarter = "Q1";
  else if (month <= 5) quarter = "Q2";
  else if (month <= 8) quarter = "Q3";
  else quarter = "Q4";
  return { quarter, year, label: `${quarter} ${year}` };
}

export function quarterDateRange(
  quarter: IftaQuarterId,
  year: number,
): { from: string; to: string } {
  const ranges: Record<IftaQuarterId, [string, string]> = {
    Q1: [`${year}-01-01`, `${year}-03-31`],
    Q2: [`${year}-04-01`, `${year}-06-30`],
    Q3: [`${year}-07-01`, `${year}-09-30`],
    Q4: [`${year}-10-01`, `${year}-12-31`],
  };
  const [from, to] = ranges[quarter];
  return { from, to };
}

function trip(
  id: string,
  truckId: string,
  date: string,
  state: UsStateCode,
  miles: number,
  opts?: Partial<IftaTripSegment>,
): IftaTripSegment {
  return {
    id,
    tenantId: DEMO_TENANT_ID,
    truckId,
    date,
    state,
    miles,
    taxable: opts?.taxable ?? true,
    driverId: opts?.driverId,
    loadId: opts?.loadId,
    notes: opts?.notes,
  };
}

function fuel(
  id: string,
  truckId: string,
  date: string,
  state: UsStateCode,
  vendor: string,
  gallons: number,
  pricePerGallon: number,
  opts?: Partial<IftaFuelPurchase>,
): IftaFuelPurchase {
  const totalCost = Math.round(gallons * pricePerGallon * 100) / 100;
  return {
    id,
    tenantId: DEMO_TENANT_ID,
    truckId,
    date,
    state,
    vendor,
    gallons,
    pricePerGallon,
    totalCost,
    receiptUrl: opts?.receiptUrl ?? null,
    receiptStatus: opts?.receiptStatus ?? "attached",
    driverId: opts?.driverId,
    notes: opts?.notes,
  };
}

export function buildSeedTrips(): IftaTripSegment[] {
  return [
    // Q1 2026 — truck-102 TX corridor
    trip("trip-001", "truck-102", "2026-01-12", "TX", 420, { driverId: "onkar-singh" }),
    trip("trip-002", "truck-102", "2026-01-13", "OK", 185, { driverId: "onkar-singh" }),
    trip("trip-003", "truck-102", "2026-01-14", "AR", 210, { driverId: "onkar-singh" }),
    trip("trip-004", "truck-102", "2026-02-03", "TX", 380, { driverId: "onkar-singh" }),
    trip("trip-005", "truck-102", "2026-02-04", "LA", 260, { driverId: "onkar-singh" }),
    trip("trip-006", "truck-102", "2026-03-08", "TX", 95, {
      driverId: "onkar-singh",
      taxable: false,
      notes: "Yard / deadhead non-taxable",
    }),

    // Q1 — truck-104 Midwest
    trip("trip-007", "truck-104", "2026-01-20", "TX", 310),
    trip("trip-008", "truck-104", "2026-01-21", "OK", 240),
    trip("trip-009", "truck-104", "2026-01-22", "KS", 190),
    trip("trip-010", "truck-104", "2026-02-15", "MO", 280),
    trip("trip-011", "truck-104", "2026-02-16", "IL", 220),
    trip("trip-012", "truck-104", "2026-03-10", "IN", 175),

    // Q2 2026 — primary filing quarter (heavy seed)
    trip("trip-013", "truck-102", "2026-04-02", "TX", 455, { driverId: "onkar-singh" }),
    trip("trip-014", "truck-102", "2026-04-03", "OK", 198, { driverId: "onkar-singh" }),
    trip("trip-015", "truck-102", "2026-04-04", "AR", 225, { driverId: "onkar-singh" }),
    trip("trip-016", "truck-102", "2026-04-05", "MO", 310, { driverId: "onkar-singh" }),
    trip("trip-017", "truck-102", "2026-04-06", "IL", 265, { driverId: "onkar-singh" }),
    trip("trip-018", "truck-102", "2026-04-07", "IN", 180, { driverId: "onkar-singh" }),
    trip("trip-019", "truck-102", "2026-04-08", "OH", 240, { driverId: "onkar-singh" }),
    trip("trip-020", "truck-102", "2026-04-09", "PA", 195, { driverId: "onkar-singh" }),
    trip("trip-021", "truck-102", "2026-05-12", "PA", 160, { driverId: "onkar-singh" }),
    trip("trip-022", "truck-102", "2026-05-13", "OH", 210, { driverId: "onkar-singh" }),
    trip("trip-023", "truck-102", "2026-05-14", "KY", 185, { driverId: "onkar-singh" }),
    trip("trip-024", "truck-102", "2026-05-15", "TN", 230, { driverId: "onkar-singh" }),
    trip("trip-025", "truck-102", "2026-05-16", "AR", 200, { driverId: "onkar-singh" }),
    trip("trip-026", "truck-102", "2026-05-17", "TX", 340, { driverId: "onkar-singh" }),
    trip("trip-027", "truck-102", "2026-06-04", "TX", 110, {
      driverId: "onkar-singh",
      taxable: false,
    }),
    trip("trip-028", "truck-102", "2026-06-18", "TX", 390, { driverId: "onkar-singh" }),
    trip("trip-029", "truck-102", "2026-06-19", "NM", 280, { driverId: "onkar-singh" }),
    trip("trip-030", "truck-102", "2026-06-20", "CO", 320, { driverId: "onkar-singh" }),

    trip("trip-031", "truck-104", "2026-04-10", "TX", 280),
    trip("trip-032", "truck-104", "2026-04-11", "OK", 205),
    trip("trip-033", "truck-104", "2026-04-12", "MO", 295),
    trip("trip-034", "truck-104", "2026-04-13", "IL", 240),
    trip("trip-035", "truck-104", "2026-05-05", "IL", 185),
    trip("trip-036", "truck-104", "2026-05-06", "IA", 260),
    trip("trip-037", "truck-104", "2026-05-07", "MO", 210),
    trip("trip-038", "truck-104", "2026-06-02", "AR", 175),
    trip("trip-039", "truck-104", "2026-06-03", "TX", 360),

    trip("trip-040", "truck-107", "2026-04-15", "TX", 190),
    trip("trip-041", "truck-107", "2026-04-16", "LA", 245),
    trip("trip-042", "truck-107", "2026-04-17", "MS", 180),
    trip("trip-043", "truck-107", "2026-05-20", "TX", 220),
    trip("trip-044", "truck-107", "2026-05-21", "OK", 160),

    trip("trip-045", "truck-110", "2026-04-22", "TX", 410, { driverId: "marcus-reed" }),
    trip("trip-046", "truck-110", "2026-04-23", "OK", 175, { driverId: "marcus-reed" }),
    trip("trip-047", "truck-110", "2026-04-24", "KS", 230, { driverId: "marcus-reed" }),
    trip("trip-048", "truck-110", "2026-05-28", "MO", 195, { driverId: "marcus-reed" }),
    trip("trip-049", "truck-110", "2026-05-29", "IL", 250, { driverId: "marcus-reed" }),
    trip("trip-050", "truck-110", "2026-06-12", "IN", 165, { driverId: "marcus-reed" }),
    trip("trip-051", "truck-110", "2026-06-13", "OH", 200, { driverId: "marcus-reed" }),
    trip("trip-052", "truck-110", "2026-06-14", "PA", 140, { driverId: "marcus-reed" }),

    // Q3 2026 — partial (current quarter as of Jul 17)
    trip("trip-053", "truck-102", "2026-07-02", "TX", 380, { driverId: "onkar-singh" }),
    trip("trip-054", "truck-102", "2026-07-03", "OK", 190, { driverId: "onkar-singh" }),
    trip("trip-055", "truck-102", "2026-07-08", "AR", 215, { driverId: "onkar-singh" }),
    trip("trip-056", "truck-104", "2026-07-05", "TX", 300),
    trip("trip-057", "truck-104", "2026-07-06", "MO", 270),
    trip("trip-058", "truck-110", "2026-07-10", "TX", 350, { driverId: "marcus-reed" }),
    trip("trip-059", "truck-110", "2026-07-11", "LA", 210, { driverId: "marcus-reed" }),
  ];
}

export function buildSeedFuelPurchases(): IftaFuelPurchase[] {
  return [
    fuel("fuel-ifta-001", "truck-102", "2026-01-12", "TX", "Love's Travel Stop", 118, 3.42, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-001.pdf",
    }),
    fuel("fuel-ifta-002", "truck-102", "2026-01-14", "AR", "Pilot Flying J", 96, 3.55, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-002.pdf",
    }),
    fuel("fuel-ifta-003", "truck-104", "2026-01-22", "KS", "TA Travel Center", 105, 3.38, {
      receiptUrl: "/receipts/fuel-ifta-003.pdf",
    }),
    fuel("fuel-ifta-004", "truck-104", "2026-02-16", "IL", "Pilot Flying J", 112, 3.89, {
      receiptUrl: "/receipts/fuel-ifta-004.pdf",
    }),

    // Q2 — mix of attached / missing / duplicate
    fuel("fuel-ifta-005", "truck-102", "2026-04-02", "TX", "Love's Travel Stop", 125, 3.48, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-005.pdf",
    }),
    fuel("fuel-ifta-006", "truck-102", "2026-04-04", "AR", "Pilot Flying J", 88, 3.52, {
      driverId: "onkar-singh",
      receiptStatus: "missing",
    }),
    fuel("fuel-ifta-007", "truck-102", "2026-04-06", "IL", "Road Ranger", 110, 3.91, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-007.pdf",
    }),
    fuel("fuel-ifta-008", "truck-102", "2026-04-08", "OH", "Pilot Flying J", 102, 3.72, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-008.pdf",
    }),
    fuel("fuel-ifta-009", "truck-102", "2026-04-09", "PA", "TA Travel Center", 95, 4.05, {
      driverId: "onkar-singh",
      receiptStatus: "missing",
    }),
    fuel("fuel-ifta-010", "truck-102", "2026-05-14", "KY", "Love's Travel Stop", 98, 3.61, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-010.pdf",
    }),
    fuel("fuel-ifta-011", "truck-102", "2026-05-16", "AR", "Pilot Flying J", 86, 3.5, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-011.pdf",
      receiptStatus: "duplicate_suspect",
      notes: "Same vendor/gallons as prior AR fill within 48h",
    }),
    fuel("fuel-ifta-012", "truck-102", "2026-06-19", "NM", "Love's Travel Stop", 115, 3.44, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-012.pdf",
    }),
    fuel("fuel-ifta-013", "truck-102", "2026-06-20", "CO", "Sapp Bros", 108, 3.58, {
      driverId: "onkar-singh",
      receiptStatus: "missing",
    }),

    fuel("fuel-ifta-014", "truck-104", "2026-04-11", "OK", "Love's Travel Stop", 100, 3.4, {
      receiptUrl: "/receipts/fuel-ifta-014.pdf",
    }),
    fuel("fuel-ifta-015", "truck-104", "2026-04-13", "IL", "Pilot Flying J", 118, 3.88, {
      receiptUrl: "/receipts/fuel-ifta-015.pdf",
    }),
    fuel("fuel-ifta-016", "truck-104", "2026-05-06", "IA", "TA Travel Center", 92, 3.55, {
      receiptStatus: "missing",
    }),
    fuel("fuel-ifta-017", "truck-104", "2026-06-03", "TX", "Love's Travel Stop", 120, 3.46, {
      receiptUrl: "/receipts/fuel-ifta-017.pdf",
    }),

    fuel("fuel-ifta-018", "truck-107", "2026-04-16", "LA", "Pilot Flying J", 140, 3.35, {
      receiptUrl: "/receipts/fuel-ifta-018.pdf",
      notes: "High gallons — shop reposition",
    }),
    fuel("fuel-ifta-019", "truck-107", "2026-05-21", "OK", "Love's Travel Stop", 75, 3.41, {
      receiptStatus: "missing",
    }),

    fuel("fuel-ifta-020", "truck-110", "2026-04-22", "TX", "Love's Travel Stop", 130, 3.47, {
      driverId: "marcus-reed",
      receiptUrl: "/receipts/fuel-ifta-020.pdf",
    }),
    fuel("fuel-ifta-021", "truck-110", "2026-04-24", "KS", "TA Travel Center", 95, 3.39, {
      driverId: "marcus-reed",
      receiptUrl: "/receipts/fuel-ifta-021.pdf",
    }),
    fuel("fuel-ifta-022", "truck-110", "2026-05-29", "IL", "Pilot Flying J", 108, 3.9, {
      driverId: "marcus-reed",
      receiptStatus: "missing",
    }),
    fuel("fuel-ifta-023", "truck-110", "2026-06-13", "OH", "Pilot Flying J", 101, 3.7, {
      driverId: "marcus-reed",
      receiptUrl: "/receipts/fuel-ifta-023.pdf",
    }),
    fuel("fuel-ifta-024", "truck-110", "2026-06-14", "PA", "TA Travel Center", 88, 4.02, {
      driverId: "marcus-reed",
      receiptUrl: "/receipts/fuel-ifta-024.pdf",
      receiptStatus: "duplicate_suspect",
    }),

    // Q3
    fuel("fuel-ifta-025", "truck-102", "2026-07-02", "TX", "Love's Travel Stop", 122, 3.49, {
      driverId: "onkar-singh",
      receiptUrl: "/receipts/fuel-ifta-025.pdf",
    }),
    fuel("fuel-ifta-026", "truck-102", "2026-07-08", "AR", "Pilot Flying J", 90, 3.53, {
      driverId: "onkar-singh",
      receiptStatus: "missing",
    }),
    fuel("fuel-ifta-027", "truck-104", "2026-07-06", "MO", "TA Travel Center", 104, 3.45, {
      receiptUrl: "/receipts/fuel-ifta-027.pdf",
    }),
    fuel("fuel-ifta-028", "truck-110", "2026-07-11", "LA", "Pilot Flying J", 99, 3.36, {
      driverId: "marcus-reed",
      receiptUrl: "/receipts/fuel-ifta-028.pdf",
    }),
  ];
}

function buildSeedState(): IftaStoreState {
  return {
    version: 1,
    trips: buildSeedTrips(),
    fuelPurchases: buildSeedFuelPurchases(),
    reports: [],
  };
}

let memoryState: IftaStoreState | null = null;

function cloneState(state: IftaStoreState): IftaStoreState {
  return structuredClone(state);
}

export function getIftaStore(): IftaStoreState {
  if (canUseStorage()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IftaStoreState;
        if (parsed?.version === 1 && Array.isArray(parsed.trips)) {
          memoryState = parsed;
          return cloneState(parsed);
        }
      }
    } catch {
      // fall through to seed
    }
    const seeded = buildSeedState();
    memoryState = seeded;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return cloneState(seeded);
  }

  if (!memoryState) {
    memoryState = buildSeedState();
  }
  return cloneState(memoryState);
}

function persist(next: IftaStoreState) {
  memoryState = next;
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

export function listIftaTrips(tenantId = DEMO_TENANT_ID): IftaTripSegment[] {
  return getIftaStore().trips.filter((t) => t.tenantId === tenantId);
}

export function listIftaFuelPurchases(
  tenantId = DEMO_TENANT_ID,
): IftaFuelPurchase[] {
  return getIftaStore().fuelPurchases.filter((f) => f.tenantId === tenantId);
}

export function listIftaReports(tenantId = DEMO_TENANT_ID): IftaGeneratedReport[] {
  return getIftaStore()
    .reports.filter((r) => r.tenantId === tenantId)
    .sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    );
}

export function filterByQuarter<T extends { date: string }>(
  items: T[],
  quarter: IftaQuarterId,
  year: number,
): T[] {
  const { from, to } = quarterDateRange(quarter, year);
  return items.filter((item) => item.date >= from && item.date <= to);
}

export function saveGeneratedReport(
  report: Omit<IftaGeneratedReport, "id" | "downloadHistory"> & {
    id?: string;
    downloadHistory?: IftaDownloadRecord[];
  },
): IftaGeneratedReport {
  const state = getIftaStore();
  const saved: IftaGeneratedReport = {
    ...report,
    id: report.id ?? `ifta-report-${Date.now()}`,
    downloadHistory: report.downloadHistory ?? [],
  };
  const next: IftaStoreState = {
    ...state,
    reports: [saved, ...state.reports.filter((r) => r.id !== saved.id)],
  };
  persist(next);
  return saved;
}

export function recordReportDownload(
  reportId: string,
  download: Omit<IftaDownloadRecord, "id">,
): IftaGeneratedReport | null {
  const state = getIftaStore();
  const idx = state.reports.findIndex((r) => r.id === reportId);
  if (idx < 0) return null;
  const report = state.reports[idx];
  const entry: IftaDownloadRecord = {
    ...download,
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  const updated: IftaGeneratedReport = {
    ...report,
    downloadHistory: [entry, ...report.downloadHistory],
  };
  const reports = [...state.reports];
  reports[idx] = updated;
  persist({ ...state, reports });
  return updated;
}

export function resetIftaStoreToSeed(): IftaStoreState {
  const seeded = buildSeedState();
  persist(seeded);
  return cloneState(seeded);
}

export type GenerateQuarterPackageInput = {
  quarter: IftaQuarterId;
  year: number;
  generatedBy: string;
  kind?: IftaReportKind;
  title?: string;
  summary: IftaGeneratedReport["summary"];
};

export function generateQuarterPackage(
  input: GenerateQuarterPackageInput,
): IftaGeneratedReport {
  const title =
    input.title ??
    `${input.quarter} ${input.year} IFTA Report Package`;
  return saveGeneratedReport({
    tenantId: DEMO_TENANT_ID,
    quarter: input.quarter,
    year: input.year,
    kind: input.kind ?? "package",
    title,
    generatedAt: new Date().toISOString(),
    generatedBy: input.generatedBy,
    summary: input.summary,
  });
}
