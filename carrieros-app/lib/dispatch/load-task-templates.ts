import { formatLoadNumber } from "@/lib/dispatch/communication";

export type LoadTaskContext = {
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  rate?: number;
  driverName?: string;
  brokerName?: string;
};

function formatRate(rate?: number): string {
  if (rate == null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rate);
}

export function buildRateConEmailSubject(reference: string): string {
  return `Rate Confirmation — Load #${formatLoadNumber(reference)}`;
}

export function buildRateConEmailBody(context: LoadTaskContext): string {
  const loadNumber = formatLoadNumber(context.loadReference);

  return [
    "Hello,",
    "",
    "Please find the rate confirmation details for this load:",
    "",
    `Load #: ${loadNumber}`,
    `Rate: ${formatRate(context.rate)}`,
    `Pickup: ${context.pickupLabel}`,
    `Delivery: ${context.deliveryLabel}`,
    "",
    "Please confirm receipt at your earliest convenience.",
    "",
    "Thank you.",
  ].join("\n");
}

export function buildNotifyBrokerEmailSubject(reference: string): string {
  return `Load Update — Load #${formatLoadNumber(reference)}`;
}

export function buildNotifyBrokerEmailBody(context: LoadTaskContext): string {
  const loadNumber = formatLoadNumber(context.loadReference);

  return [
    "Hello,",
    "",
    "Quick update on this load:",
    "",
    `Load #: ${loadNumber}`,
    `Pickup: ${context.pickupLabel}`,
    `Delivery: ${context.deliveryLabel}`,
    context.driverName ? `Driver: ${context.driverName}` : null,
    "",
    "Please let us know if you need anything else.",
    "",
    "Thank you.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildPodRequestSmsBody(context: LoadTaskContext): string {
  const loadNumber = formatLoadNumber(context.loadReference);

  return [
    `Hi${context.driverName ? ` ${context.driverName.split(" ")[0]}` : ""},`,
    "",
    `Please upload your POD for Load #${loadNumber} when delivered.`,
    `Delivery: ${context.deliveryLabel}`,
    "",
    "Reply here if you have any issues. Thanks!",
  ].join("\n");
}

export function buildRequestPaymentEmailSubject(reference: string): string {
  return `Payment Request — Load #${formatLoadNumber(reference)}`;
}

export function buildRequestPaymentEmailBody(context: LoadTaskContext): string {
  const loadNumber = formatLoadNumber(context.loadReference);

  return [
    "Hello,",
    "",
    "Following up on payment for the completed load below:",
    "",
    `Load #: ${loadNumber}`,
    `Rate: ${formatRate(context.rate)}`,
    `Pickup: ${context.pickupLabel}`,
    `Delivery: ${context.deliveryLabel}`,
    "",
    "Please confirm payment status or share the expected remittance date.",
    "",
    "Thank you.",
  ].join("\n");
}
