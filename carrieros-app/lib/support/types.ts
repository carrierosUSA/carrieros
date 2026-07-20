export type IssueSeverity = "critical" | "high" | "medium" | "low" | "informational";

export type IssueCategory =
  | "system"
  | "operations"
  | "ux"
  | "billing"
  | "integration"
  | "documents"
  | "compliance"
  | "sync";

export type IssueStatus =
  | "detected"
  | "diagnosing"
  | "auto_repairing"
  | "waiting_for_user"
  | "escalated"
  | "assigned"
  | "in_progress"
  | "waiting_for_third_party"
  | "testing"
  | "resolved"
  | "closed"
  | "reopened";

export type SupportQueue =
  | "technical"
  | "billing"
  | "integrations"
  | "compliance"
  | "accounting"
  | "data"
  | "security"
  | "product"
  | "user_training";

export type SetupStepStatus =
  | "completed"
  | "required"
  | "recommended"
  | "missing"
  | "needs_review";

export type SetupStepId =
  | "company_profile"
  | "mc_dot"
  | "address_contacts"
  | "trucks"
  | "trailers"
  | "drivers"
  | "insurance"
  | "factoring"
  | "bank_details"
  | "accountant_access"
  | "eld_connection"
  | "fuel_card"
  | "email_setup"
  | "notification_prefs"
  | "ifta_settings"
  | "payroll_settings"
  | "safety_documents"
  | "user_roles";

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
  whyNeeded: string;
  whereToFind: string;
  example: string;
  status: SetupStepStatus;
  critical: boolean;
  href: string;
  skipped?: boolean;
};

export type SetupProgress = {
  percent: number;
  completed: number;
  total: number;
  requiredMissing: number;
  steps: SetupStep[];
};

export type RepairAttempt = {
  id: string;
  at: string;
  action: string;
  safe: boolean;
  result: "success" | "failed" | "skipped" | "needs_approval";
  detail: string;
};

export type SupportTimelineEvent = {
  id: string;
  at: string;
  kind: string;
  message: string;
  actor: "alph" | "carrier" | "support" | "system";
  visibleToCarrier: boolean;
};

export type SupportIssue = {
  id: string;
  ticketNumber: string;
  tenantId: string;
  title: string;
  summary: string;
  humanMessage: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  queue: SupportQueue;
  detectedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  page?: string;
  device?: string;
  browser?: string;
  errorMessage?: string;
  integration?: string;
  dataAffected?: string;
  alphDiagnosis: string;
  repairAttempts: RepairAttempt[];
  workaround?: string;
  assignedTeam?: string;
  assignedPerson?: string;
  estimatedUpdate?: string;
  autoResolvable: boolean;
  risky: boolean;
  carrierVisible: boolean;
  /**
   * When false, keep the ticket in Support but do not show the global red banner.
   * Use for demo/platform seed noise so ops alerts stay visible without looking like app failure.
   */
  surfaceInBanner?: boolean;
  rootCause?: string;
  resolutionSummary?: string;
  changesMade?: string;
  testingCompleted?: string;
  prevention?: string;
  productImprovement?: string;
  followUpChecks?: { at: string; result: "ok" | "regressed" }[];
  timeline: SupportTimelineEvent[];
  internalNotes?: string[];
  carrierComments?: string[];
};

export type HealthServiceStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance";

export type HealthService = {
  id: string;
  name: string;
  status: HealthServiceStatus;
  latencyMs?: number;
  lastCheckedAt: string;
  detail?: string;
};

export type ProductImprovement = {
  id: string;
  title: string;
  issueIds: string[];
  companiesAffected: number;
  recommendedFix: string;
  createdAt: string;
  status: "open" | "planned" | "done";
};

export type AutoHealActionId =
  | "retry_email"
  | "retry_sms"
  | "retry_upload"
  | "restart_job"
  | "reconnect_integration"
  | "rerun_ocr"
  | "rebuild_report"
  | "fix_formatting"
  | "remove_temp_duplicate"
  | "refresh_stale_data"
  | "recalc_dashboard"
  | "resync_eld"
  | "restore_defaults"
  | "guide_missing_fields"
  | "suggest_permissions"
  | "clear_cache"
  | "reprocess_notifications";

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  detected: "Detected",
  diagnosing: "Diagnosing",
  auto_repairing: "Auto-Repairing",
  waiting_for_user: "Waiting for User",
  escalated: "Escalated",
  assigned: "Assigned",
  in_progress: "In Progress",
  waiting_for_third_party: "Waiting for Third Party",
  testing: "Testing",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
};

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  informational: "Informational",
};

export type SupportStoreSnapshot = {
  setup: SetupProgress;
  issues: SupportIssue[];
  health: HealthService[];
  productImprovements: ProductImprovement[];
  auditLog: {
    id: string;
    at: string;
    action: string;
    detail: string;
    safe: boolean;
  }[];
};
