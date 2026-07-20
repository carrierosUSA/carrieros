/**
 * Shared communication composer foundation (email / SMS / voice).
 * Draft → recipient → preview → log. Never pretends send without a configured provider.
 */

import {
  dispatchCompose,
  getActiveProvider,
  mockProvider,
  sendgridProvider,
  twilioProvider,
} from "@/lib/communications/providers";
import type { ComposeInput, ProviderKind, ProviderResult } from "@/lib/communications/types";
import { getServerSecret } from "@/lib/security/secrets";
import { appendAlphAudit } from "@/lib/alph/audit/store";

export type AlphComposerChannel = "email" | "sms" | "voice";

export type AlphComposerDraft = {
  id: string;
  channel: AlphComposerChannel;
  subject?: string;
  body: string;
  recipients: Array<{ name?: string; email?: string; phone?: string }>;
  createdAt: string;
  previewText: string;
};

export type AlphComposerSendState =
  | {
      status: "draft";
      message: string;
    }
  | {
      status: "not_sent";
      message: string;
      reason: "provider_not_configured" | "user_cancelled" | "permission";
    }
  | {
      status: "sent_mock";
      message: string;
      externalId?: string;
      fallbackUrl?: string;
    }
  | {
      status: "sent";
      message: string;
      externalId?: string;
    };

export type AlphComposerResult = {
  draft: AlphComposerDraft;
  send: AlphComposerSendState;
  providerKind: ProviderKind;
  providerConfigured: boolean;
  logged: boolean;
};

function newDraftId(): string {
  return `alph_msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    getServerSecret("TWILIO_ACCOUNT_SID") &&
      getServerSecret("TWILIO_AUTH_TOKEN"),
  );
}

export function isSendgridConfigured(): boolean {
  return Boolean(getServerSecret("SENDGRID_API_KEY"));
}

export function resolveComposerProvider(
  channel: AlphComposerChannel,
): { kind: ProviderKind; configured: boolean; label: string } {
  if (channel === "email") {
    if (isSendgridConfigured()) {
      return { kind: "sendgrid", configured: true, label: sendgridProvider.name };
    }
    return {
      kind: "sendgrid",
      configured: false,
      label: "SendGrid · not configured",
    };
  }
  if (isTwilioConfigured()) {
    return { kind: "twilio", configured: true, label: twilioProvider.name };
  }
  return {
    kind: "twilio",
    configured: false,
    label: "Twilio · not configured",
  };
}

export function createAlphComposerDraft(input: {
  channel: AlphComposerChannel;
  body: string;
  subject?: string;
  recipients: AlphComposerDraft["recipients"];
}): AlphComposerDraft {
  const previewParts = [
    input.subject ? `Subject: ${input.subject}` : null,
    `To: ${input.recipients
      .map((r) => r.name || r.email || r.phone || "unknown")
      .join(", ")}`,
    input.body,
  ].filter(Boolean);

  return {
    id: newDraftId(),
    channel: input.channel,
    subject: input.subject,
    body: input.body,
    recipients: input.recipients,
    createdAt: new Date().toISOString(),
    previewText: previewParts.join("\n"),
  };
}

/**
 * Attempt send. If no live provider is configured, returns not_sent —
 * never claims a live message was delivered.
 * Optional allowMockLog logs via mock provider for demo UX only (explicit flag).
 */
export async function sendAlphComposerDraft(input: {
  draft: AlphComposerDraft;
  tenantId: string;
  companyId: string;
  userId: string;
  /** Demo-only: log through mock provider without claiming live delivery. */
  allowMockLog?: boolean;
  loadId?: string;
  driverId?: string;
}): Promise<AlphComposerResult> {
  const resolved = resolveComposerProvider(input.draft.channel);
  const composeInput: ComposeInput = {
    channel:
      input.draft.channel === "voice"
        ? "voice"
        : input.draft.channel === "sms"
          ? "sms"
          : "email",
    subject: input.draft.subject,
    body: input.draft.body,
    participants: input.draft.recipients.map((r) => ({
      name: r.name ?? "Contact",
      email: r.email,
      phone: r.phone,
      role: "other",
    })),
    linkedTo: {
      loadId: input.loadId,
      driverId: input.driverId,
      companyId: input.companyId,
    },
  };

  if (!resolved.configured) {
    if (input.allowMockLog) {
      const mockResult: ProviderResult = await mockProvider[
        input.draft.channel === "email"
          ? "sendEmail"
          : input.draft.channel === "sms"
            ? "sendSms"
            : "makeCall"
      ](composeInput);

      appendAlphAudit({
        requestId: input.draft.id,
        companyId: input.companyId,
        tenantId: input.tenantId,
        userId: input.userId,
        event: "draft_created",
        details: `Composer mock-log only (${input.draft.channel}) — not a live send`,
        meta: { draftId: input.draft.id, mock: true },
      });

      return {
        draft: input.draft,
        providerKind: "mock",
        providerConfigured: false,
        logged: true,
        send: {
          status: "sent_mock",
          message: `${mockResult.message} Live ${resolved.label}. Message was NOT sent to a real provider.`,
          externalId: mockResult.externalId,
          fallbackUrl: mockResult.fallbackUrl,
        },
      };
    }

    appendAlphAudit({
      requestId: input.draft.id,
      companyId: input.companyId,
      tenantId: input.tenantId,
      userId: input.userId,
      event: "tool_failed",
      details: `Composer not sent — ${resolved.label}`,
      meta: { draftId: input.draft.id, channel: input.draft.channel },
    });

    return {
      draft: input.draft,
      providerKind: resolved.kind,
      providerConfigured: false,
      logged: true,
      send: {
        status: "not_sent",
        reason: "provider_not_configured",
        message: `${resolved.label}. Draft saved for review — nothing was sent.`,
      },
    };
  }

  // Live keys present but adapters still stub → refuse rather than fake success.
  const active = getActiveProvider();
  void active;
  const result = await dispatchCompose(composeInput);
  if (!result.ok) {
    return {
      draft: input.draft,
      providerKind: resolved.kind,
      providerConfigured: true,
      logged: true,
      send: {
        status: "not_sent",
        reason: "provider_not_configured",
        message:
          result.message ||
          "Provider adapter not ready. Draft kept — nothing sent.",
      },
    };
  }

  appendAlphAudit({
    requestId: input.draft.id,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    event: "execution_result",
    details: `Composer send via ${resolved.kind}`,
    meta: { draftId: input.draft.id, externalId: result.externalId ?? null },
  });

  return {
    draft: input.draft,
    providerKind: resolved.kind,
    providerConfigured: true,
    logged: true,
    send: {
      status: "sent",
      message: result.message,
      externalId: result.externalId,
    },
  };
}
