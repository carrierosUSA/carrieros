import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import { driverStore } from "@/lib/data/driver-store";
import { trailerStore, truckStore } from "@/lib/data/fleet-store";
import { buildAlphMigrationSummary } from "@/lib/migration/summary";
import {
  buildPreviewRows,
  detectCleaningIssues,
  summarizePreview,
} from "@/lib/migration/cleaning";
import { projectRows, suggestColumnMappings } from "@/lib/migration/mapping";
import type {
  AlphMigrationSummary,
  ClassifiedDocument,
  CleaningIssue,
  CleaningResolution,
  ColumnMapping,
  ImportedFileMeta,
  MigrationAuditEvent,
  MigrationCategory,
  MigrationRun,
  MigrationSandboxRecord,
  MigrationSnapshot,
  MigrationStoreState,
  MigrationWizardStep,
  MigrationYear,
  OverwritePolicy,
  ParsedSheet,
  PreviewRow,
} from "@/lib/migration/types";
import type { Driver } from "@/lib/types";
import type { Trailer, Truck } from "@/lib/types";

const STORAGE_KEY = "transpo.migration.v1";
const DEFAULT_ACTOR = "You";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyCounts() {
  return {
    found: 0,
    ready: 0,
    warnings: 0,
    errors: 0,
    duplicates: 0,
    skipped: 0,
    imported: 0,
  };
}

function defaultState(): MigrationStoreState {
  return {
    runs: [],
    sandbox: [],
    documents: [],
    snapshots: [],
    summaries: [],
    updatedAt: nowIso(),
  };
}

let memoryState: MigrationStoreState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function readState(): MigrationStoreState {
  if (memoryState) return memoryState;
  if (!canUseStorage()) {
    memoryState = defaultState();
    return memoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryState = defaultState();
      return memoryState;
    }
    memoryState = { ...defaultState(), ...JSON.parse(raw) } as MigrationStoreState;
    return memoryState;
  } catch {
    memoryState = defaultState();
    return memoryState;
  }
}

function writeState(next: MigrationStoreState) {
  memoryState = { ...next, updatedAt: nowIso() };
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
  }
  notify();
}

export function subscribeMigrationStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMigrationState(): MigrationStoreState {
  return readState();
}

export function listMigrationRuns(): MigrationRun[] {
  return [...readState().runs].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export function getMigrationRun(id: string): MigrationRun | undefined {
  return readState().runs.find((r) => r.id === id);
}

export function listSandboxRecords(runId?: string): MigrationSandboxRecord[] {
  const all = readState().sandbox;
  return runId ? all.filter((r) => r.runId === runId) : all;
}

export function getMigrationSummary(id: string): AlphMigrationSummary | undefined {
  return readState().summaries.find((s) => s.id === id);
}

export function getSummaryForRun(runId: string): AlphMigrationSummary | undefined {
  return readState().summaries.find((s) => s.runId === runId);
}

export function listClassifiedDocuments(): ClassifiedDocument[] {
  return [...readState().documents].sort(
    (a, b) => b.fileName.localeCompare(a.fileName),
  );
}

function audit(
  run: MigrationRun,
  step: MigrationAuditEvent["step"],
  action: string,
  detail?: string,
): MigrationAuditEvent {
  return {
    id: uid("audit"),
    at: nowIso(),
    step,
    actor: DEFAULT_ACTOR,
    action,
    detail,
  };
}

function replaceRun(run: MigrationRun) {
  const state = readState();
  writeState({
    ...state,
    runs: state.runs.map((r) => (r.id === run.id ? run : r)),
  });
}

export function createMigrationRun(input?: {
  categories?: MigrationCategory[];
  year?: MigrationYear | null;
}): MigrationRun {
  const run: MigrationRun = {
    id: uid("mig"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    createdBy: DEFAULT_ACTOR,
    status: "draft",
    step: "categories",
    categories: input?.categories ?? [],
    year: input?.year ?? 2025,
    files: [],
    sheet: null,
    mappings: [],
    cleaningIssues: [],
    previewRows: [],
    overwritePolicy: "never_overwrite",
    backupAcknowledged: false,
    auditNote: "",
    auditLog: [],
    snapshotId: null,
    counts: emptyCounts(),
  };
  run.auditLog.push(audit(run, "categories", "Started migration draft"));
  const state = readState();
  writeState({ ...state, runs: [run, ...state.runs] });
  return run;
}

export function updateRunCategories(
  runId: string,
  categories: MigrationCategory[],
  year: MigrationYear | null,
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const next: MigrationRun = {
    ...run,
    categories,
    year,
    step: "upload",
    status: "draft",
    updatedAt: nowIso(),
    auditLog: [
      ...run.auditLog,
      audit(run, "categories", "Selected categories", categories.join(", ")),
    ],
  };
  replaceRun(next);
  return next;
}

export function attachParsedSheet(
  runId: string,
  sheet: ParsedSheet,
  files: ImportedFileMeta[],
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const mappings =
    sheet.headers.length > 0
      ? suggestColumnMappings(sheet.headers, run.categories)
      : [];
  const next: MigrationRun = {
    ...run,
    files,
    sheet,
    mappings,
    step: sheet.headers.length > 0 ? "mapping" : "upload",
    status: sheet.headers.length > 0 ? "mapping" : "draft",
    updatedAt: nowIso(),
    auditLog: [
      ...run.auditLog,
      audit(
        run,
        "upload",
        "Uploaded files",
        files.map((f) => f.name).join(", "),
      ),
    ],
  };
  replaceRun(next);
  return next;
}

export function updateRunMappings(
  runId: string,
  mappings: ColumnMapping[],
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const next: MigrationRun = {
    ...run,
    mappings,
    step: "mapping",
    status: "mapping",
    updatedAt: nowIso(),
    auditLog: [
      ...run.auditLog,
      audit(run, "mapping", "Updated column mapping"),
    ],
  };
  replaceRun(next);
  return next;
}

function inferPrimaryCategory(run: MigrationRun): MigrationCategory {
  const mapped = new Set(
    run.mappings.map((m) => m.targetField).filter(Boolean) as string[],
  );
  if (mapped.has("unitNumber") && (mapped.has("vin") || mapped.has("make"))) {
    if (run.categories.includes("trucks")) return "trucks";
    if (run.categories.includes("trailers")) return "trailers";
  }
  if (mapped.has("licenseNumber") || mapped.has("medicalExpiresAt")) {
    if (run.categories.includes("drivers")) return "drivers";
  }
  if (mapped.has("reference") || mapped.has("originCity")) {
    if (run.categories.includes("loads")) return "loads";
  }
  if (mapped.has("mcNumber") || mapped.has("dotNumber")) {
    if (run.categories.includes("brokers")) return "brokers";
  }
  return run.categories[0] ?? "drivers";
}

export function runCleaningPass(runId: string): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run?.sheet) return undefined;
  const primary = inferPrimaryCategory(run);
  const projected = projectRows(run.sheet.rows, run.mappings);
  const cleaningIssues = detectCleaningIssues(projected, primary);
  const previewRows = buildPreviewRows(projected, cleaningIssues, primary);
  const counts = { ...summarizePreview(previewRows), imported: 0 };
  const next: MigrationRun = {
    ...run,
    cleaningIssues,
    previewRows,
    counts,
    step: "cleaning",
    status: "cleaning",
    updatedAt: nowIso(),
    auditLog: [
      ...run.auditLog,
      audit(
        run,
        "cleaning",
        "Ran AI data cleaning suggestions",
        `${cleaningIssues.length} issues highlighted — none applied silently`,
      ),
    ],
  };
  replaceRun(next);
  return next;
}

export function resolveIssue(
  runId: string,
  issueId: string,
  resolution: CleaningResolution,
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run?.sheet) return undefined;
  const cleaningIssues = run.cleaningIssues.map((i) =>
    i.id === issueId ? { ...i, resolution } : i,
  );
  return rebuildPreview(run, cleaningIssues);
}

export function resolveAllIssues(
  runId: string,
  resolution: CleaningResolution,
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run?.sheet) return undefined;
  const cleaningIssues = run.cleaningIssues.map((i) =>
    i.resolution ? i : { ...i, resolution },
  );
  return rebuildPreview(run, cleaningIssues);
}

function rebuildPreview(
  run: MigrationRun,
  cleaningIssues: CleaningIssue[],
): MigrationRun {
  const primary = inferPrimaryCategory(run);
  const projected = projectRows(run.sheet!.rows, run.mappings);
  const previewRows = buildPreviewRows(projected, cleaningIssues, primary);
  const counts = { ...summarizePreview(previewRows), imported: run.counts.imported };
  const next: MigrationRun = {
    ...run,
    cleaningIssues,
    previewRows,
    counts,
    updatedAt: nowIso(),
  };
  replaceRun(next);
  return next;
}

export function setPreviewSelection(
  runId: string,
  rowId: string,
  selected: boolean,
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const previewRows = run.previewRows.map((r) =>
    r.id === rowId ? { ...r, selected } : r,
  );
  const counts = { ...summarizePreview(previewRows), imported: run.counts.imported };
  const next = { ...run, previewRows, counts, step: "preview" as const, status: "preview" as const, updatedAt: nowIso() };
  replaceRun(next);
  return next;
}

export function advanceToPreview(runId: string): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const next: MigrationRun = {
    ...run,
    step: "preview",
    status: "preview",
    updatedAt: nowIso(),
    auditLog: [...run.auditLog, audit(run, "preview", "Opened import preview")],
  };
  replaceRun(next);
  return next;
}

export function setConfirmOptions(
  runId: string,
  opts: {
    overwritePolicy: OverwritePolicy;
    backupAcknowledged: boolean;
    auditNote: string;
  },
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const next: MigrationRun = {
    ...run,
    ...opts,
    step: "confirm",
    status: "confirmed",
    updatedAt: nowIso(),
    auditLog: [
      ...run.auditLog,
      audit(
        run,
        "confirm",
        "Set confirm options",
        `policy=${opts.overwritePolicy}; backup=${opts.backupAcknowledged}`,
      ),
    ],
  };
  replaceRun(next);
  return next;
}

function snapshotLiveStores(runId: string): MigrationSnapshot {
  return {
    id: uid("snap"),
    runId,
    createdAt: nowIso(),
    drivers: structuredClone(driverStore),
    trucks: structuredClone(truckStore),
    trailers: structuredClone(trailerStore),
    sandboxRecords: listSandboxRecords().map((r) => structuredClone(r)),
  };
}

function softLinkDrivers(
  rows: PreviewRow[],
  policy: OverwritePolicy,
): { imported: number; skipped: number } {
  let imported = 0;
  let skipped = 0;
  for (const row of rows) {
    if (!row.selected || row.status === "skipped" || row.status === "error") {
      skipped++;
      continue;
    }
    const name = row.data.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }
    const existing = driverStore.find(
      (d) => d.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (policy === "never_overwrite" || policy === "skip_existing") {
        skipped++;
        continue;
      }
      if (policy === "update_with_confirm") {
        existing.phone = row.data.phone || existing.phone;
        existing.email = row.data.email || existing.email;
        existing.licenseNumber = row.data.licenseNumber || existing.licenseNumber;
        existing.licenseState = row.data.licenseState || existing.licenseState;
        existing.updatedAt = nowIso();
        imported++;
        continue;
      }
    }
    const driver: Driver = {
      tenantId: DEMO_TENANT_ID,
      id: uid("mig-driver"),
      name,
      email: row.data.email || `${name.toLowerCase().replace(/\s+/g, ".")}@imported.local`,
      role: "Company Driver",
      status: (row.data.status as Driver["status"]) || "active",
      phone: row.data.phone || "",
      location: row.data.location || "",
      homeTerminal: row.data.homeTerminal,
      hireDate: row.data.hireDate || nowIso().slice(0, 10),
      licenseClass: row.data.licenseClass || "CDL A",
      licenseNumber: row.data.licenseNumber || "PENDING",
      licenseState: row.data.licenseState || "TX",
      licenseExpiresAt: row.data.licenseExpiresAt || "2030-01-01",
      medicalExpiresAt: row.data.medicalExpiresAt || "2030-01-01",
      payRate: 0.55,
      payType: "per_mile",
      novaSummary: "Imported via AI Migration Center — verify credentials before assignment.",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    driverStore.push(driver);
    imported++;
  }
  return { imported, skipped };
}

function softLinkTrucks(
  rows: PreviewRow[],
  policy: OverwritePolicy,
): { imported: number; skipped: number } {
  let imported = 0;
  let skipped = 0;
  for (const row of rows) {
    if (!row.selected || row.status === "skipped" || row.status === "error") {
      skipped++;
      continue;
    }
    const unit = row.data.unitNumber?.trim();
    if (!unit) {
      skipped++;
      continue;
    }
    const existing = truckStore.find((t) => t.unitNumber === unit);
    if (existing) {
      if (policy === "never_overwrite" || policy === "skip_existing") {
        skipped++;
        continue;
      }
      if (policy === "update_with_confirm") {
        existing.vin = row.data.vin || existing.vin;
        existing.make = row.data.make || existing.make;
        existing.model = row.data.model || existing.model;
        existing.mileage = Number(row.data.mileage) || existing.mileage;
        imported++;
        continue;
      }
    }
    const truck: Truck = {
      tenantId: DEMO_TENANT_ID,
      id: uid("mig-truck"),
      unitNumber: unit,
      status: (row.data.status as Truck["status"]) || "available",
      make: row.data.make || "Unknown",
      model: row.data.model || "Unknown",
      year: Number(row.data.year) || new Date().getFullYear(),
      vin: row.data.vin || "PENDING",
      licensePlate: row.data.licensePlate || "",
      licenseState: row.data.licenseState,
      mileage: Number(row.data.mileage) || 0,
      location: row.data.location,
    };
    truckStore.push(truck);
    imported++;
  }
  return { imported, skipped };
}

/**
 * Execute import after human confirmation.
 * Always snapshots first. Never silently overwrites.
 */
export function executeImport(runId: string): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  if (!run.backupAcknowledged) {
    const failed = {
      ...run,
      status: "failed" as const,
      errorMessage: "Backup acknowledgment is required before import.",
      updatedAt: nowIso(),
    };
    replaceRun(failed);
    return failed;
  }

  const snapshot = snapshotLiveStores(runId);
  const state = readState();
  writeState({
    ...state,
    snapshots: [snapshot, ...state.snapshots],
  });

  let working = getMigrationRun(runId)!;
  working = {
    ...working,
    step: "importing",
    status: "importing",
    snapshotId: snapshot.id,
    updatedAt: nowIso(),
    auditLog: [
      ...working.auditLog,
      audit(working, "importing", "Created backup snapshot", snapshot.id),
    ],
  };
  replaceRun(working);

  const selected = working.previewRows.filter((r) => r.selected);
  const sandboxRecords: MigrationSandboxRecord[] = selected.map((row) => ({
    id: uid("sb"),
    runId,
    category: row.category,
    year: working.year ?? undefined,
    data: row.data,
    importedAt: nowIso(),
  }));

  let liveImported = 0;
  let liveSkipped = 0;

  if (working.categories.includes("drivers")) {
    const driverRows = selected.filter((r) => r.category === "drivers");
    const r = softLinkDrivers(driverRows, working.overwritePolicy);
    liveImported += r.imported;
    liveSkipped += r.skipped;
  }
  if (working.categories.includes("trucks")) {
    const truckRows = selected.filter((r) => r.category === "trucks");
    const r = softLinkTrucks(truckRows, working.overwritePolicy);
    liveImported += r.imported;
    liveSkipped += r.skipped;
  }

  // Trailers — sandbox only unless unit present (keep soft-link minimal)
  if (working.categories.includes("trailers")) {
    for (const row of selected.filter((r) => r.category === "trailers")) {
      const unit = row.data.unitNumber?.trim();
      if (!unit) continue;
      const exists = trailerStore.some((t) => t.unitNumber === unit);
      if (exists && working.overwritePolicy !== "update_with_confirm") continue;
      if (!exists) {
        const trailer: Trailer = {
          tenantId: DEMO_TENANT_ID,
          id: uid("mig-trailer"),
          unitNumber: unit,
          status: "available",
          type: (row.data.type as Trailer["type"]) || "dry_van",
          make: row.data.make,
          year: Number(row.data.year) || undefined,
          vin: row.data.vin,
          licensePlate: row.data.licensePlate || "",
        };
        trailerStore.push(trailer);
        liveImported++;
      }
    }
  }

  const summary = buildAlphMigrationSummary(
    {
      ...working,
      counts: {
        ...working.counts,
        imported: selected.length,
        skipped: working.counts.skipped + liveSkipped,
      },
    },
    sandboxRecords,
  );

  const latest = readState();
  const completed: MigrationRun = {
    ...working,
    step: "summary",
    status: "completed",
    summaryId: summary.id,
    counts: {
      ...working.counts,
      imported: selected.length,
      skipped: working.counts.skipped + Math.max(0, liveSkipped - liveImported),
    },
    updatedAt: nowIso(),
    auditLog: [
      ...working.auditLog,
      audit(
        working,
        "summary",
        "Import completed",
        `${selected.length} sandbox records; ${liveImported} linked to Drivers/Fleet`,
      ),
    ],
  };

  writeState({
    ...latest,
    runs: latest.runs.map((r) => (r.id === runId ? completed : r)),
    sandbox: [...sandboxRecords, ...latest.sandbox],
    summaries: [summary, ...latest.summaries],
  });

  return completed;
}

export function rollbackMigration(runId: string): {
  ok: boolean;
  message: string;
} {
  const state = readState();
  const run = state.runs.find((r) => r.id === runId);
  if (!run?.snapshotId) {
    return { ok: false, message: "No backup snapshot available for this import." };
  }
  const snap = state.snapshots.find((s) => s.id === run.snapshotId);
  if (!snap) {
    return { ok: false, message: "Backup snapshot could not be found." };
  }

  driverStore.splice(0, driverStore.length, ...(snap.drivers as Driver[]));
  truckStore.splice(0, truckStore.length, ...(snap.trucks as Truck[]));
  trailerStore.splice(0, trailerStore.length, ...(snap.trailers as Trailer[]));

  const nextRun: MigrationRun = {
    ...run,
    status: "rolled_back",
    updatedAt: nowIso(),
    auditLog: [
      ...run.auditLog,
      audit(run, "rollback", "Rolled back to pre-import snapshot", snap.id),
    ],
  };

  writeState({
    ...state,
    runs: state.runs.map((r) => (r.id === runId ? nextRun : r)),
    sandbox: snap.sandboxRecords,
    summaries: state.summaries.filter((s) => s.runId !== runId),
  });

  return {
    ok: true,
    message: "Import rolled back. Drivers, fleet, and sandbox restored from backup.",
  };
}

export function setRunStep(
  runId: string,
  step: MigrationWizardStep,
): MigrationRun | undefined {
  const run = getMigrationRun(runId);
  if (!run) return undefined;
  const next = { ...run, step, updatedAt: nowIso() };
  replaceRun(next);
  return next;
}

export function addClassifiedDocuments(docs: ClassifiedDocument[]): void {
  const state = readState();
  writeState({
    ...state,
    documents: [...docs, ...state.documents],
  });
}

export function updateClassifiedDocument(doc: ClassifiedDocument): void {
  const state = readState();
  writeState({
    ...state,
    documents: state.documents.map((d) => (d.id === doc.id ? doc : d)),
  });
}

export function fileConfirmedDocuments(): number {
  const state = readState();
  let count = 0;
  const documents = state.documents.map((d) => {
    if (d.confirmed && !d.filed) {
      count++;
      return { ...d, filed: true };
    }
    return d;
  });
  writeState({ ...state, documents });
  return count;
}

export function searchMigrationHistory(query: string): MigrationRun[] {
  const q = query.trim().toLowerCase();
  const runs = listMigrationRuns();
  if (!q) return runs;
  return runs.filter((r) => {
    const hay = [
      r.id,
      r.createdBy,
      String(r.year ?? ""),
      r.status,
      ...r.categories,
      ...r.files.map((f) => f.name),
      r.auditNote,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
