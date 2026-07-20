export type {
  IssueSeverity,
  IssueCategory,
  IssueStatus,
  SupportQueue,
  SetupStepStatus,
  SetupStepId,
  SetupStep,
  SetupProgress,
  RepairAttempt,
  SupportTimelineEvent,
  SupportIssue,
  HealthServiceStatus,
  HealthService,
  ProductImprovement,
  AutoHealActionId,
  SupportStoreSnapshot,
} from "@/lib/support/types";
export { ISSUE_STATUS_LABELS, SEVERITY_LABELS } from "@/lib/support/types";
export {
  buildSetupProgress,
  setupStatusLabel,
} from "@/lib/support/setup";
export {
  SAFE_AUTO_HEAL,
  isAutoHealSafe,
  runSafeAutoHeal,
} from "@/lib/support/auto-heal";
export {
  buildSupportHealth,
  healthStatusLabel,
  overallHealth,
  detectSeedIssues,
} from "@/lib/support/detection";
export {
  buildSupportStats,
  activeIssueBanner,
  alphHelpAnswer,
} from "@/lib/support/board";
export {
  subscribeSupportStore,
  getSupportStore,
  getSupportStoreServerSnapshot,
  getOpenCarrierIssues,
  markSetupStep,
  attemptAutoResolve,
  escalateIssue,
  updateIssueStatus,
  markIssueResolved,
  reopenIssue,
  confirmResolved,
  runFollowUpCheck,
  createSupportIssue,
  resetSupportStore,
} from "@/lib/support/store";
