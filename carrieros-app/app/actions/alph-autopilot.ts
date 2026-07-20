"use server";

import { listAlphAudit } from "@/lib/alph/audit";
import { preparePayrollStatement } from "@/lib/alph/payroll";
import {
  createAlphComposerDraft,
  resolveComposerProvider,
  sendAlphComposerDraft,
  type AlphComposerChannel,
} from "@/lib/alph/communications";
import {
  resolveAlphOcrSetup,
  resolveAlphProviderSetup,
} from "@/lib/alph/providers/env";
import { listAlphSupportRecommendations } from "@/lib/alph/support/recommendations";
import { getCurrentSession } from "@/lib/auth/session";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getSupportStore } from "@/lib/support/store";

export async function getAlphProviderStatusAction() {
  return {
    model: resolveAlphProviderSetup(),
    ocr: resolveAlphOcrSetup(),
    email: resolveComposerProvider("email"),
    sms: resolveComposerProvider("sms"),
  };
}

export async function listAlphActionHistoryAction(limit = 50) {
  const session = getCurrentSession();
  return listAlphAudit({
    companyId: session.companyId,
    tenantId: getActiveTenantId(),
    limit,
  });
}

export async function prepareAlphPayrollStatementAction() {
  const session = getCurrentSession();
  return preparePayrollStatement({
    tenantId: getActiveTenantId(),
    companyId: session.companyId,
  });
}

export async function composeAlphMessageAction(input: {
  channel: AlphComposerChannel;
  body: string;
  subject?: string;
  recipients: Array<{ name?: string; email?: string; phone?: string }>;
  allowMockLog?: boolean;
  loadId?: string;
  driverId?: string;
}) {
  const session = getCurrentSession();
  const draft = createAlphComposerDraft({
    channel: input.channel,
    body: input.body,
    subject: input.subject,
    recipients: input.recipients,
  });
  return sendAlphComposerDraft({
    draft,
    tenantId: getActiveTenantId(),
    companyId: session.companyId,
    userId: session.userId,
    allowMockLog: input.allowMockLog,
    loadId: input.loadId,
    driverId: input.driverId,
  });
}

export async function listAlphSupportRecommendationsAction() {
  const store = getSupportStore();
  return listAlphSupportRecommendations(store.issues);
}
