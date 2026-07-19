import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
} from "@/lib/dispatch/communication";
import type {
  ComposeInput,
  ProviderKind,
  ProviderResult,
} from "@/lib/communications/types";

export type CommunicationProvider = {
  kind: ProviderKind;
  name: string;
  statusLabel: string;
  sendSms: (input: ComposeInput) => Promise<ProviderResult>;
  makeCall: (input: ComposeInput) => Promise<ProviderResult>;
  sendEmail: (input: ComposeInput) => Promise<ProviderResult>;
  sendChat: (input: ComposeInput) => Promise<ProviderResult>;
};

function primaryPhone(input: ComposeInput): string | undefined {
  return input.participants.find((p) => p.phone)?.phone;
}

function primaryEmail(input: ComposeInput): string | undefined {
  return input.participants.find((p) => p.email)?.email;
}

export const mockProvider: CommunicationProvider = {
  kind: "mock",
  name: "Mock provider",
  statusLabel: "Mock provider · Twilio ready",
  async sendSms(input) {
    const phone = primaryPhone(input);
    const fallbackUrl = phone ? buildSmsUrl(phone, input.body) : undefined;
    return {
      ok: true,
      provider: "mock",
      externalId: `mock-sms-${Date.now()}`,
      message: "SMS logged (mock). Twilio adapter ready.",
      fallbackUrl,
    };
  },
  async makeCall(input) {
    const phone = primaryPhone(input);
    const fallbackUrl = phone ? buildTelUrl(phone) : undefined;
    return {
      ok: true,
      provider: "mock",
      externalId: `mock-call-${Date.now()}`,
      message: "Call logged (mock). Twilio Voice ready.",
      fallbackUrl,
    };
  },
  async sendEmail(input) {
    const email = primaryEmail(input);
    const fallbackUrl = email
      ? buildMailtoUrl(email, input.subject ?? "Transpo.ai", input.body)
      : undefined;
    return {
      ok: true,
      provider: "mock",
      externalId: `mock-email-${Date.now()}`,
      message: "Email logged (mock). SendGrid ready.",
      fallbackUrl,
    };
  },
  async sendChat(input) {
    return {
      ok: true,
      provider: "mock",
      externalId: `mock-chat-${Date.now()}`,
      message: input.chatRoom
        ? `Message posted to ${input.chatRoom}.`
        : "Internal chat message posted.",
    };
  },
};

/** Stub — wire Twilio Programmable SMS / Voice here. */
export const twilioProvider: CommunicationProvider = {
  kind: "twilio",
  name: "Twilio",
  statusLabel: "Twilio · not configured",
  async sendSms() {
    return {
      ok: false,
      provider: "twilio",
      message: "Twilio SMS not configured. Using mock provider.",
    };
  },
  async makeCall() {
    return {
      ok: false,
      provider: "twilio",
      message: "Twilio Voice not configured. Using mock provider.",
    };
  },
  async sendEmail() {
    return {
      ok: false,
      provider: "twilio",
      message: "Twilio does not send email. Use SendGrid.",
    };
  },
  async sendChat() {
    return {
      ok: false,
      provider: "twilio",
      message: "Twilio does not handle internal chat.",
    };
  },
};

/** Stub — wire SendGrid / SES here. */
export const sendgridProvider: CommunicationProvider = {
  kind: "sendgrid",
  name: "SendGrid",
  statusLabel: "SendGrid · not configured",
  async sendSms() {
    return {
      ok: false,
      provider: "sendgrid",
      message: "SendGrid does not send SMS. Use Twilio.",
    };
  },
  async makeCall() {
    return {
      ok: false,
      provider: "sendgrid",
      message: "SendGrid does not place calls. Use Twilio.",
    };
  },
  async sendEmail() {
    return {
      ok: false,
      provider: "sendgrid",
      message: "SendGrid not configured. Using mock provider.",
    };
  },
  async sendChat() {
    return {
      ok: false,
      provider: "sendgrid",
      message: "SendGrid does not handle internal chat.",
    };
  },
};

let activeProvider: CommunicationProvider = mockProvider;

export function getActiveProvider(): CommunicationProvider {
  return activeProvider;
}

export function setActiveProvider(kind: ProviderKind): CommunicationProvider {
  if (kind === "twilio") {
    activeProvider = twilioProvider;
  } else if (kind === "sendgrid") {
    activeProvider = sendgridProvider;
  } else {
    activeProvider = mockProvider;
  }
  return activeProvider;
}

export async function dispatchCompose(
  input: ComposeInput,
): Promise<ProviderResult> {
  const provider = getActiveProvider();

  switch (input.channel) {
    case "sms":
      return provider.sendSms(input);
    case "voice":
      return provider.makeCall(input);
    case "email":
      return provider.sendEmail(input);
    case "chat":
      return provider.sendChat(input);
    default:
      return {
        ok: false,
        provider: provider.kind,
        message: "Unknown channel",
      };
  }
}
