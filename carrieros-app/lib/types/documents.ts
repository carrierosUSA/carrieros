import type { TenantEntity } from "@/lib/types/base";

export const DOCUMENT_CATEGORIES = [
  "rate_confirmation",
  "pod",
  "bol",
  "invoice",
  "lumper_receipt",
  "fuel_receipt",
  "miscellaneous",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  rate_confirmation: "Rate Confirmation",
  pod: "Proof of Delivery",
  bol: "Bill of Lading",
  invoice: "Invoice",
  lumper_receipt: "Lumper Receipt",
  fuel_receipt: "Fuel Receipt",
  miscellaneous: "Unknown",
};

export const DOCUMENT_EXTRACTED_FIELD_KEYS = [
  "loadNumber",
  "broker",
  "brokerLoadId",
  "pickupNumber",
  "deliveryNumber",
  "driver",
  "truck",
  "trailer",
  "pickup",
  "pickupCityState",
  "pickupAddress",
  "pickupDate",
  "pickupTime",
  "delivery",
  "deliveryCityState",
  "deliveryAddress",
  "deliveryDate",
  "deliveryTime",
  "rate",
  "miles",
  "equipmentType",
  "commodity",
  "weight",
  "pieces",
  "receiver",
  "invoiceNumber",
  "poNumber",
  "bolNumber",
  "temperature",
  "detention",
  "lumper",
  "instructions",
  "date",
  "time",
] as const;

export type DocumentExtractedFieldKey =
  (typeof DOCUMENT_EXTRACTED_FIELD_KEYS)[number];

export type DocumentExtractedField = {
  key: DocumentExtractedFieldKey;
  label: string;
  value: string;
  confidence: number;
  needsHumanVerification?: boolean;
};

export interface DocumentReference extends TenantEntity {
  id: string;
  companyId: string;
  filename: string;
  category: DocumentCategory;
  status: "processing" | "needs_review" | "ready" | "failed" | "archived";
  loadId?: string;
}
