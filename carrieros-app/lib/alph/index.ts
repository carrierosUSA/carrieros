export {
  ALPH_AGENTS,
  getAlphAgent,
  getAlphAgentCopilotHref,
  listAlphAgents,
} from "@/lib/alph/agents";
export { executeAlphCommand, runAlphCommand } from "@/lib/alph/executor";
export {
  annotateAlphCriticalAssist,
  alphPermissionDeniedResult,
  gateAlphIntent,
  permissionForAlphIntent,
  type AlphGateResult,
} from "@/lib/alph/security";
export {
  clearAlphHistory,
  listAlphHistory,
  pushAlphHistory,
} from "@/lib/alph/history";
export {
  ALPH_DEMO_TODAY,
  ALPH_INTENT_CATALOG,
  ALPH_SUGGESTION_COMMANDS,
  getIntentDefinition,
} from "@/lib/alph/intents";
export { looksLikeAlphQuery, parseAlphCommand } from "@/lib/alph/parser";
export type {
  AlphAgent,
  AlphAgentId,
  AlphAgentStatus,
  AlphCommand,
  AlphEntities,
  AlphIntentDefinition,
  AlphIntentId,
  AlphParsedCommand,
  AlphResult,
  AlphResultAction,
  AlphResultType,
} from "@/lib/alph/types";
export {
  createAlphVoiceListener,
  isAlphVoiceSupported,
  type AlphVoiceListener,
  type AlphVoiceStatus,
} from "@/lib/alph/voice";

/** Enterprise Alph architecture foundation */
export { ALPH_IDENTITY, ALPH_ASSISTANT_ID, ALPH_ASSISTANT_NAME } from "@/lib/alph/identity";
export {
  ALPH_MODES,
  ALPH_MODE_LABELS,
  parseAlphMode,
  type AlphMode,
} from "@/lib/alph/modes";
export {
  buildAlphContext,
  resolveWorkspaceFocus,
  type AlphBuiltContext,
  type AlphContextInput,
} from "@/lib/alph/context";
export {
  ensureAlphToolsRegistered,
  executeAlphTool,
  listAlphTools,
  type AlphToolId,
} from "@/lib/alph/tools";
export { runAlphTurn, streamAlphTurn } from "@/lib/alph/orchestrator";
export {
  createAlphApprovalRequest,
  decideAlphApproval,
  canExecuteCriticalAlphAction,
  toAlphApprovalPreview,
} from "@/lib/alph/approval";
export { appendAlphAudit, listAlphAudit } from "@/lib/alph/audit";
export {
  createAlphConversation,
  listAlphConversations,
  archiveAlphConversation,
} from "@/lib/alph/conversation";
export { resolveAlphProvider, mockAlphProvider } from "@/lib/alph/providers";
export {
  createAlphStreamController,
  type AlphStreamEvent,
} from "@/lib/alph/streaming";
export { runAlphFoundationSelfCheck } from "@/lib/alph/selfcheck";

/** Autopilot foundation (Phase A) */
export {
  AUTOPILOT_MODES,
  AUTOPILOT_MODE_LABELS,
  actionAllowedAtAutopilotMode,
  getAlphAutopilotSettings,
  parseAutopilotMode,
  saveAlphAutopilotSettings,
  type AutopilotMode,
} from "@/lib/alph/autopilot";
export {
  buildAlphCommandPreview,
  requestAlphCommandApproval,
  understandAlphCommand,
} from "@/lib/alph/command";
export {
  runAlphOcrExtract,
  resolveAlphOcrProvider,
  type AlphOcrExtractResult,
  type AlphOcrProviderId,
} from "@/lib/alph/ocr";
export {
  listInbox,
  uploadToDocumentInbox,
  type DocumentInboxItem,
} from "@/lib/alph/document-inbox";
export { preparePayrollStatement } from "@/lib/alph/payroll";
export {
  createAlphComposerDraft,
  sendAlphComposerDraft,
} from "@/lib/alph/communications";
