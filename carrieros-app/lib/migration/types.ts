import type { ConfidenceLevel } from "@/lib/ai-safety";

/** Categories a carrier can migrate into Transpo.ai */
export type MigrationCategory =
  | "drivers"
  | "trucks"
  | "trailers"
  | "loads"
  | "customers"
  | "brokers"
  | "invoices"
  | "payroll"
  | "fuel"
  | "maintenance"
  | "documents"
  | "expenses"
  | "settlements";

export type MigrationYear = 2022 | 2023 | 2024 | 2025 | 2026;

export type MigrationWizardStep =
  | "categories"
  | "upload"
  | "mapping"
  | "cleaning"
  | "preview"
  | "confirm"
  | "importing"
  | "summary";

export type MigrationRunStatus =
  | "draft"
  | "mapping"
  | "cleaning"
  | "preview"
  | "confirmed"
  | "importing"
  | "completed"
  | "failed"
  | "rolled_back";

export type OverwritePolicy = "skip_existing" | "update_with_confirm" | "never_overwrite";

export type CleaningResolution = "fix" | "skip" | "keep";

export type CleaningIssueSeverity = "info" | "warning" | "error";

export type CleaningIssueKind =
  | "duplicate"
  | "missing_value"
  | "invalid_date"
  | "invalid_mc"
  | "invalid_dot"
  | "invalid_vin"
  | "invalid_currency"
  | "negative_value"
  | "formatting";

export type DocumentClass =
  | "pod"
  | "rate_con"
  | "invoice"
  | "fuel"
  | "lumper"
  | "repair"
  | "insurance"
  | "registration"
  | "permits"
  | "unknown";

export type MigrationFileKind =
  | "csv"
  | "xlsx"
  | "pdf"
  | "google_sheets"
  | "quickbooks"
  | "image"
  | "other";

export type MigrationTargetField = string;

export type ColumnMapping = {
  sourceColumn: string;
  targetField: MigrationTargetField | null;
  confidence: ConfidenceLevel;
  /** 0–1 numeric score for sorting */
  score: number;
  /** Synonym that matched, if any */
  matchedSynonym?: string;
  /** User overrode AI suggestion */
  manual: boolean;
};

export type ParsedSheet = {
  fileName: string;
  fileKind: MigrationFileKind;
  headers: string[];
  rows: Record<string, string>[];
  /** True when parse was demo/stub rather than real extraction */
  stubParse: boolean;
  parseNote?: string;
};

export type CleaningIssue = {
  id: string;
  rowIndex: number;
  field?: string;
  kind: CleaningIssueKind;
  severity: CleaningIssueSeverity;
  message: string;
  suggestedValue?: string;
  resolution: CleaningResolution | null;
};

export type PreviewRow = {
  id: string;
  rowIndex: number;
  category: MigrationCategory;
  data: Record<string, string>;
  selected: boolean;
  status: "ready" | "warning" | "error" | "duplicate" | "skipped";
  issues: string[];
};

export type MigrationAuditEvent = {
  id: string;
  at: string;
  step: MigrationWizardStep | "rollback" | "document_classify" | "file_reject";
  actor: string;
  action: string;
  detail?: string;
};

export type MigrationSnapshot = {
  id: string;
  runId: string;
  createdAt: string;
  drivers: unknown[];
  trucks: unknown[];
  trailers: unknown[];
  sandboxRecords: MigrationSandboxRecord[];
};

export type MigrationSandboxRecord = {
  id: string;
  runId: string;
  category: MigrationCategory;
  year?: MigrationYear;
  data: Record<string, string>;
  importedAt: string;
};

export type ImportedFileMeta = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  kind: MigrationFileKind;
  validated: boolean;
  rejectedReason?: string;
};

export type MigrationRun = {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: MigrationRunStatus;
  step: MigrationWizardStep;
  categories: MigrationCategory[];
  year: MigrationYear | null;
  files: ImportedFileMeta[];
  sheet: ParsedSheet | null;
  mappings: ColumnMapping[];
  cleaningIssues: CleaningIssue[];
  previewRows: PreviewRow[];
  overwritePolicy: OverwritePolicy;
  backupAcknowledged: boolean;
  auditNote: string;
  auditLog: MigrationAuditEvent[];
  snapshotId: string | null;
  counts: {
    found: number;
    ready: number;
    warnings: number;
    errors: number;
    duplicates: number;
    skipped: number;
    imported: number;
  };
  errorMessage?: string;
  summaryId?: string;
};

export type ClassifiedDocument = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  classification: DocumentClass;
  confidence: ConfidenceLevel;
  score: number;
  confirmed: boolean;
  filed: boolean;
  notes?: string;
};

export type AlphMigrationSummary = {
  id: string;
  runId: string;
  createdAt: string;
  year: MigrationYear | null;
  business: string;
  fleet: string;
  drivers: string;
  customers: string;
  brokers: string;
  revenueTrends: string;
  topCustomers: string[];
  topBrokers: string[];
  utilization: string;
  missingInfo: string[];
  dataIssues: string[];
  suggestedImprovements: string[];
  /** Decision-support only — never auto-applied */
  decisionSupportOnly: true;
};

export type MigrationConnectorStatus = "coming_soon" | "available";

export type MigrationConnector = {
  id: string;
  name: string;
  description: string;
  status: MigrationConnectorStatus;
  /** Suggested export path if not connected */
  exportHint?: string;
};

export type MigrationStoreState = {
  runs: MigrationRun[];
  sandbox: MigrationSandboxRecord[];
  documents: ClassifiedDocument[];
  snapshots: MigrationSnapshot[];
  summaries: AlphMigrationSummary[];
  updatedAt: string;
};
