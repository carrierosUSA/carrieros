import type { LoadStatus } from "@/lib/types";
import type { HealthDocumentKind } from "@/lib/documents/types";

/**
 * Tenant-configurable required document checklist.
 * Replace or override per tenant later without changing health scoring.
 */

export type RequiredDocumentRule = {
  kind: HealthDocumentKind;
  label: string;
  /** Core required document when status/equipment gates pass */
  required: boolean;
  /** Load statuses where this rule is evaluated */
  requiredFromStatus?: LoadStatus[];
  /** Soft-require when equipment matches (substring, case-insensitive) */
  equipmentIncludes?: string[];
  /** Critical if missing (blocks dispatch / invoice) vs warning */
  criticalWhenMissing?: boolean;
  /** Who typically supplies this document */
  defaultOwner: "broker" | "driver" | "accounting" | "ops";
};

export type RequiredDocumentsConfig = {
  rules: RequiredDocumentRule[];
};

/** Default CarrierOS checklist — tenants can customize later. */
export const DEFAULT_REQUIRED_DOCUMENTS: RequiredDocumentsConfig = {
  rules: [
    {
      kind: "rate_confirmation",
      label: "Rate Confirmation",
      required: true,
      requiredFromStatus: [
        "pending",
        "dispatched",
        "picked_up",
        "in_transit",
        "delivered",
        "invoiced",
      ],
      criticalWhenMissing: true,
      defaultOwner: "broker",
    },
    {
      kind: "bol",
      label: "BOL",
      required: true,
      requiredFromStatus: [
        "dispatched",
        "picked_up",
        "in_transit",
        "delivered",
        "invoiced",
      ],
      criticalWhenMissing: true,
      defaultOwner: "broker",
    },
    {
      kind: "pod",
      label: "POD",
      required: true,
      requiredFromStatus: ["delivered", "invoiced"],
      criticalWhenMissing: true,
      defaultOwner: "driver",
    },
    {
      kind: "invoice",
      label: "Invoice",
      required: true,
      requiredFromStatus: ["delivered", "invoiced"],
      criticalWhenMissing: false,
      defaultOwner: "accounting",
    },
    {
      kind: "lumper_receipt",
      label: "Lumper Receipt",
      required: false,
      requiredFromStatus: ["delivered", "invoiced"],
      criticalWhenMissing: true,
      defaultOwner: "driver",
    },
    {
      kind: "fuel_receipt",
      label: "Fuel Receipt",
      required: false,
      requiredFromStatus: ["in_transit", "delivered", "invoiced"],
      criticalWhenMissing: false,
      defaultOwner: "driver",
    },
    {
      kind: "scale_ticket",
      label: "Scale Ticket",
      required: false,
      defaultOwner: "driver",
    },
    {
      kind: "washout_receipt",
      label: "Washout Receipt",
      required: false,
      equipmentIncludes: ["tanker"],
      defaultOwner: "driver",
    },
    {
      kind: "temperature_logs",
      label: "Temperature Logs",
      required: true,
      equipmentIncludes: ["reefer"],
      requiredFromStatus: ["in_transit", "delivered", "invoiced"],
      criticalWhenMissing: true,
      defaultOwner: "driver",
    },
    {
      kind: "driver_signature",
      label: "Driver Signature",
      required: false,
      requiredFromStatus: ["delivered", "invoiced"],
      criticalWhenMissing: false,
      defaultOwner: "driver",
    },
    {
      kind: "receiver_signature",
      label: "Receiver Signature",
      required: false,
      requiredFromStatus: ["delivered", "invoiced"],
      criticalWhenMissing: true,
      defaultOwner: "driver",
    },
    {
      kind: "pickup_photos",
      label: "Pickup Photos",
      required: false,
      requiredFromStatus: ["picked_up", "in_transit", "delivered", "invoiced"],
      defaultOwner: "driver",
    },
    {
      kind: "delivery_photos",
      label: "Delivery Photos",
      required: false,
      requiredFromStatus: ["delivered", "invoiced"],
      defaultOwner: "driver",
    },
    {
      kind: "custom",
      label: "Other Custom Documents",
      required: false,
      defaultOwner: "ops",
    },
  ],
};

let activeConfig: RequiredDocumentsConfig = DEFAULT_REQUIRED_DOCUMENTS;

export function getRequiredDocumentsConfig(): RequiredDocumentsConfig {
  return activeConfig;
}

/** Override for tenant customization (in-memory for now). */
export function setRequiredDocumentsConfig(
  config: RequiredDocumentsConfig,
): void {
  activeConfig = config;
}

export function resetRequiredDocumentsConfig(): void {
  activeConfig = DEFAULT_REQUIRED_DOCUMENTS;
}

function equipmentMatches(
  rule: RequiredDocumentRule,
  equipmentType?: string,
): boolean {
  if (!rule.equipmentIncludes?.length) {
    return true;
  }

  const equipment = (equipmentType ?? "").toLowerCase();
  return rule.equipmentIncludes.some((token) =>
    equipment.includes(token.toLowerCase()),
  );
}

function statusMatches(rule: RequiredDocumentRule, status: LoadStatus): boolean {
  if (!rule.requiredFromStatus?.length) {
    return true;
  }

  return rule.requiredFromStatus.includes(status);
}

/** Whether this rule should appear on the checklist for the load. */
export function isRuleVisible(
  rule: RequiredDocumentRule,
  status: LoadStatus,
  equipmentType?: string,
): boolean {
  if (!equipmentMatches(rule, equipmentType)) {
    return false;
  }

  // Optional docs without status gates stay visible for progressive disclosure
  if (!rule.required && !rule.requiredFromStatus?.length) {
    return true;
  }

  return statusMatches(rule, status);
}

/** Whether missing this document should count against health. */
export function isDocumentRequired(
  rule: RequiredDocumentRule,
  status: LoadStatus,
  equipmentType?: string,
): boolean {
  if (!isRuleVisible(rule, status, equipmentType)) {
    return false;
  }

  if (!rule.required) {
    return false;
  }

  return statusMatches(rule, status) && equipmentMatches(rule, equipmentType);
}

export const HEALTH_DOCUMENT_LABELS: Record<HealthDocumentKind, string> = {
  rate_confirmation: "Rate Confirmation",
  bol: "BOL",
  pod: "POD",
  invoice: "Invoice",
  lumper_receipt: "Lumper Receipt",
  fuel_receipt: "Fuel Receipt",
  scale_ticket: "Scale Ticket",
  washout_receipt: "Washout Receipt",
  temperature_logs: "Temperature Logs",
  driver_signature: "Driver Signature",
  receiver_signature: "Receiver Signature",
  pickup_photos: "Pickup Photos",
  delivery_photos: "Delivery Photos",
  custom: "Other Custom Documents",
};
