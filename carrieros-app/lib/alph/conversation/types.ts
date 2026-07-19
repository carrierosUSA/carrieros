import type { AlphMode } from "@/lib/alph/modes";
import type { AlphWorkspaceFocus } from "@/lib/alph/identity";

export type AlphConversationStatus = "active" | "archived";

export type AlphMessageRole = "user" | "assistant" | "system" | "tool";

export type AlphMessage = {
  id: string;
  conversationId: string;
  role: AlphMessageRole;
  content: string;
  createdAt: string;
  mode?: AlphMode;
  toolIds?: string[];
  recordRefs?: string[];
  citations?: Array<{ type: string; id: string; label?: string }>;
};

export type AlphConversation = {
  id: string;
  companyId: string;
  tenantId: string;
  userId: string;
  title: string;
  status: AlphConversationStatus;
  workspace: AlphWorkspaceFocus;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  searchText: string;
  retainUntil?: string;
  archivedAt?: string;
  messageCount: number;
};

export type CreateConversationInput = {
  companyId: string;
  tenantId: string;
  userId: string;
  workspace: AlphWorkspaceFocus;
  title?: string;
  /** Default retention days (company policy). */
  retentionDays?: number;
};
