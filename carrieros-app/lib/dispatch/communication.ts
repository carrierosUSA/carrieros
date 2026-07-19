import type { CallingMethod } from "@/lib/dispatch/communication-preferences";
import { buildCallUrl as buildMethodCallUrl } from "@/lib/dispatch/communication-urls";

export type LoadEmailContext = {
  loadId?: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  partyLabel?: string;
};

export function formatLoadNumber(reference: string): string {
  return reference.replace(/^LD-/i, "");
}

/** Normalize US/display numbers to E.164 (e.g. tel:+12105550189). */
export function normalizePhoneE164(phone: string): string | null {
  const trimmed = phone.trim();

  if (!trimmed || trimmed === "—") {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (trimmed.startsWith("+") && digits.length >= 10) {
    return `+${digits}`;
  }

  return null;
}

export function buildTelUrl(phone: string): string | undefined {
  const e164 = normalizePhoneE164(phone);
  return e164 ? `tel:${e164}` : undefined;
}

export function buildSmsUrl(phone: string, body?: string): string | undefined {
  const e164 = normalizePhoneE164(phone);

  if (!e164) {
    return undefined;
  }

  if (body) {
    const params = new URLSearchParams({ body });
    return `sms:${e164}?${params.toString()}`;
  }

  return `sms:${e164}`;
}

export function buildCallUrl(method: CallingMethod, phone: string): string | undefined {
  const e164 = normalizePhoneE164(phone);

  if (!e164) {
    return undefined;
  }

  return buildMethodCallUrl(method, e164);
}

export function buildMailtoUrl(
  email: string,
  subject: string,
  body: string,
): string | undefined {
  const trimmed = email.trim();

  if (!trimmed || trimmed === "—" || !trimmed.includes("@")) {
    return undefined;
  }

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${trimmed}?${params.toString()}`;
}

export function buildLoadEmailSubject(context: LoadEmailContext): string {
  const loadNumber = formatLoadNumber(context.loadReference);
  const prefix = context.partyLabel ? `${context.partyLabel} — ` : "";
  return `${prefix}Load #${loadNumber}`;
}

export function buildLoadEmailBody(context: LoadEmailContext): string {
  const loadNumber = formatLoadNumber(context.loadReference);

  return [
    "Hello,",
    "",
    `Load #${loadNumber}`,
    `Pickup: ${context.pickupLabel}`,
    `Delivery: ${context.deliveryLabel}`,
    "",
    "Thank you.",
  ].join("\n");
}

export function openCommunicationUrl(url: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    anchor.target = "_blank";
  }

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
