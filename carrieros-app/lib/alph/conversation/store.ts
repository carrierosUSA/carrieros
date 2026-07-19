import type {
  AlphConversation,
  AlphMessage,
  AlphMessageRole,
  CreateConversationInput,
} from "@/lib/alph/conversation/types";
import type { AlphMode } from "@/lib/alph/modes";
import type { AlphWorkspaceFocus } from "@/lib/alph/identity";

const conversations = new Map<string, AlphConversation>();
const messages = new Map<string, AlphMessage[]>();

const DEFAULT_RETENTION_DAYS = 90;
const MAX_MESSAGES_PER_CONV = 500;
const RECENT_MESSAGE_WINDOW = 12;

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New conversation";
  return cleaned.length > 56 ? `${cleaned.slice(0, 53)}…` : cleaned;
}

export function createAlphConversation(
  input: CreateConversationInput,
): AlphConversation {
  const now = new Date();
  const retentionDays = input.retentionDays ?? DEFAULT_RETENTION_DAYS;
  const retainUntil = new Date(
    now.getTime() + retentionDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const conv: AlphConversation = {
    id: newId("alph_conv"),
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    title: input.title ?? "New conversation",
    status: "active",
    workspace: input.workspace,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    searchText: (input.title ?? "").toLowerCase(),
    retainUntil,
    messageCount: 0,
  };
  conversations.set(conv.id, conv);
  messages.set(conv.id, []);
  return conv;
}

function assertOwnership(
  conv: AlphConversation,
  companyId: string,
  tenantId: string,
  userId?: string,
): boolean {
  if (conv.companyId !== companyId || conv.tenantId !== tenantId) return false;
  if (userId && conv.userId !== userId) return false;
  return true;
}

export function getAlphConversation(filters: {
  id: string;
  companyId: string;
  tenantId: string;
  userId?: string;
}): AlphConversation | null {
  const conv = conversations.get(filters.id);
  if (!conv) return null;
  if (!assertOwnership(conv, filters.companyId, filters.tenantId, filters.userId)) {
    return null;
  }
  return conv;
}

export function listAlphConversations(filters: {
  companyId: string;
  tenantId: string;
  userId: string;
  query?: string;
  includeArchived?: boolean;
  limit?: number;
}): AlphConversation[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  const limit = Math.min(100, Math.max(1, filters.limit ?? 30));
  return Array.from(conversations.values())
    .filter(
      (c) =>
        c.companyId === filters.companyId &&
        c.tenantId === filters.tenantId &&
        c.userId === filters.userId &&
        (filters.includeArchived || c.status === "active") &&
        (!q || c.searchText.includes(q) || c.title.toLowerCase().includes(q)),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function archiveAlphConversation(filters: {
  id: string;
  companyId: string;
  tenantId: string;
  userId: string;
}): AlphConversation | null {
  const conv = getAlphConversation(filters);
  if (!conv) return null;
  conv.status = "archived";
  conv.archivedAt = new Date().toISOString();
  conv.updatedAt = conv.archivedAt;
  conversations.set(conv.id, conv);
  return conv;
}

export function appendAlphMessage(input: {
  conversationId: string;
  companyId: string;
  tenantId: string;
  userId: string;
  role: AlphMessageRole;
  content: string;
  mode?: AlphMode;
  toolIds?: string[];
  recordRefs?: string[];
  citations?: AlphMessage["citations"];
}): AlphMessage | null {
  const conv = getAlphConversation({
    id: input.conversationId,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
  });
  if (!conv || conv.status === "archived") return null;

  const list = messages.get(conv.id) ?? [];
  const msg: AlphMessage = {
    id: newId("alph_msg"),
    conversationId: conv.id,
    role: input.role,
    content: input.content,
    createdAt: new Date().toISOString(),
    mode: input.mode,
    toolIds: input.toolIds,
    recordRefs: input.recordRefs,
    citations: input.citations,
  };
  list.push(msg);
  if (list.length > MAX_MESSAGES_PER_CONV) {
    list.splice(0, list.length - MAX_MESSAGES_PER_CONV);
  }
  messages.set(conv.id, list);

  conv.messageCount = list.length;
  conv.updatedAt = msg.createdAt;
  if (input.role === "user" && conv.title === "New conversation") {
    conv.title = titleFromPrompt(input.content);
  }
  conv.searchText = `${conv.title} ${input.content}`.toLowerCase().slice(0, 500);
  conversations.set(conv.id, conv);
  return msg;
}

/**
 * Selective retrieval: summary + last N messages — never full unlimited history.
 */
export function getAlphConversationContextWindow(filters: {
  conversationId: string;
  companyId: string;
  tenantId: string;
  userId: string;
  recentLimit?: number;
}): {
  conversation: AlphConversation;
  summary?: string;
  recent: AlphMessage[];
} | null {
  const conv = getAlphConversation({
    id: filters.conversationId,
    companyId: filters.companyId,
    tenantId: filters.tenantId,
    userId: filters.userId,
  });
  if (!conv) return null;
  const list = messages.get(conv.id) ?? [];
  const recentLimit = Math.min(
    40,
    Math.max(1, filters.recentLimit ?? RECENT_MESSAGE_WINDOW),
  );
  return {
    conversation: conv,
    summary: conv.summary,
    recent: list.slice(-recentLimit),
  };
}

export function updateAlphConversationSummary(filters: {
  conversationId: string;
  companyId: string;
  tenantId: string;
  userId: string;
  summary: string;
}): AlphConversation | null {
  const conv = getAlphConversation({
    id: filters.conversationId,
    companyId: filters.companyId,
    tenantId: filters.tenantId,
    userId: filters.userId,
  });
  if (!conv) return null;
  conv.summary = filters.summary.slice(0, 2_000);
  conv.updatedAt = new Date().toISOString();
  conversations.set(conv.id, conv);
  return conv;
}

export function setAlphConversationWorkspace(filters: {
  conversationId: string;
  companyId: string;
  tenantId: string;
  userId: string;
  workspace: AlphWorkspaceFocus;
}): AlphConversation | null {
  const conv = getAlphConversation({
    id: filters.conversationId,
    companyId: filters.companyId,
    tenantId: filters.tenantId,
    userId: filters.userId,
  });
  if (!conv) return null;
  conv.workspace = filters.workspace;
  conv.updatedAt = new Date().toISOString();
  conversations.set(conv.id, conv);
  return conv;
}

export function clearAlphConversationsForTests(): void {
  conversations.clear();
  messages.clear();
}
