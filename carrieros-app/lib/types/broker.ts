import type { TenantEntity } from "@/lib/types/base";

export const BROKER_STATUSES = ["active", "inactive", "credit_hold"] as const;
export type BrokerStatus = (typeof BROKER_STATUSES)[number];

export const BROKER_STATUS_LABELS: Record<BrokerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  credit_hold: "Credit Hold",
};

export const BROKER_PAYMENT_METHODS = [
  "standard",
  "quick_pay",
  "factoring",
] as const;
export type BrokerPaymentMethod = (typeof BROKER_PAYMENT_METHODS)[number];

export const BROKER_PAYMENT_METHOD_LABELS: Record<BrokerPaymentMethod, string> = {
  standard: "Standard Terms",
  quick_pay: "Quick Pay",
  factoring: "Factoring",
};

export const BROKER_CONTACT_ROLES = [
  "dispatcher",
  "after_hours",
  "accounting",
  "claims",
  "safety",
] as const;
export type BrokerContactRole = (typeof BROKER_CONTACT_ROLES)[number];

export const BROKER_CONTACT_ROLE_LABELS: Record<BrokerContactRole, string> = {
  dispatcher: "Dispatcher",
  after_hours: "After Hours",
  accounting: "Accounting",
  claims: "Claims",
  safety: "Safety",
};

export const BROKER_DOCUMENT_TYPES = [
  "broker_packet",
  "carrier_agreement",
  "insurance_requirements",
  "rate_confirmation",
  "other",
] as const;
export type BrokerDocumentType = (typeof BROKER_DOCUMENT_TYPES)[number];

export const BROKER_DOCUMENT_TYPE_LABELS: Record<BrokerDocumentType, string> = {
  broker_packet: "Broker Packet",
  carrier_agreement: "Carrier Agreement",
  insurance_requirements: "Insurance Requirements",
  rate_confirmation: "Rate Confirmation",
  other: "Other File",
};

export type BrokerDocumentStatus = "on_file" | "expired" | "pending";

export interface BrokerContact {
  id: string;
  role: BrokerContactRole;
  name: string;
  phone: string;
  email: string;
}

export interface BrokerDocument {
  id: string;
  type: BrokerDocumentType;
  name: string;
  uploadedAt: string;
  status: BrokerDocumentStatus;
}

export interface BrokerRateHistoryEntry {
  id: string;
  lane: string;
  rate: number;
  miles: number;
  equipment: string;
  occurredAt: string;
  loadReference?: string;
}

export interface BrokerNote {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface BrokerTimelineEvent {
  id: string;
  label: string;
  detail?: string;
  occurredAt: string;
  category: "load" | "payment" | "document" | "contact" | "alert" | "note";
}

export interface Broker extends TenantEntity {
  id: string;
  name: string;
  mcNumber?: string;
  dotNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  performanceScore?: number;
  status: BrokerStatus;
  paymentTerms: string;
  paymentMethod: BrokerPaymentMethod;
  avgPaymentDays: number;
  lastPaymentAt?: string;
  outstandingBalance: number;
  totalRevenue: number;
  homeBase?: string;
  notes?: string;
  detentionIncidents?: number;
  claimsCount?: number;
  latePaymentCount?: number;
  recommended?: boolean;
  contacts: BrokerContact[];
  documents: BrokerDocument[];
  rateHistory: BrokerRateHistoryEntry[];
  noteEntries: BrokerNote[];
  timeline: BrokerTimelineEvent[];
}
