import type { TenantEntity } from "@/lib/types/base";

/**
 * Master company directory entity (CRM).
 * Distinct from the tenant carrier `Company` in `base.ts`.
 */
export const COMPANY_TYPES = [
  "carrier",
  "broker",
  "shipper",
  "receiver",
  "factoring_company",
  "insurance_company",
  "repair_shop",
  "tire_shop",
  "fuel_vendor",
  "towing_company",
  "roadside_service",
  "warehouse",
  "cross_dock",
  "lumper_service",
  "scale",
  "port",
  "customs_broker",
  "other",
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  carrier: "Carrier",
  broker: "Broker",
  shipper: "Shipper",
  receiver: "Receiver",
  factoring_company: "Factoring Company",
  insurance_company: "Insurance Company",
  repair_shop: "Repair Shop",
  tire_shop: "Tire Shop",
  fuel_vendor: "Fuel Vendor",
  towing_company: "Towing Company",
  roadside_service: "Roadside Service",
  warehouse: "Warehouse",
  cross_dock: "Cross Dock",
  lumper_service: "Lumper Service",
  scale: "Scale",
  port: "Port",
  customs_broker: "Customs Broker",
  other: "Other",
};

export const COMPANY_STATUSES = ["active", "inactive"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const COMPANY_CONTACT_ROLES = [
  "dispatcher",
  "shipping",
  "receiving",
  "accounting",
  "claims",
  "safety",
  "manager",
] as const;
export type CompanyContactRole = (typeof COMPANY_CONTACT_ROLES)[number];

export const COMPANY_CONTACT_ROLE_LABELS: Record<CompanyContactRole, string> = {
  dispatcher: "Dispatcher",
  shipping: "Shipping",
  receiving: "Receiving",
  accounting: "Accounting",
  claims: "Claims",
  safety: "Safety",
  manager: "Manager",
};

export const COMPANY_DOCUMENT_TYPES = [
  "contract",
  "w9",
  "insurance",
  "broker_packet",
  "rate_agreement",
  "permit",
  "other",
] as const;
export type CompanyDocumentType = (typeof COMPANY_DOCUMENT_TYPES)[number];

export const COMPANY_DOCUMENT_TYPE_LABELS: Record<CompanyDocumentType, string> = {
  contract: "Contract",
  w9: "W-9",
  insurance: "Insurance",
  broker_packet: "Broker Packet",
  rate_agreement: "Rate Agreement",
  permit: "Permit",
  other: "Other File",
};

export type CompanyDocumentStatus = "on_file" | "expired" | "pending";

export const COMPANY_LOCATION_KINDS = [
  "headquarters",
  "pickup",
  "delivery",
  "warehouse",
] as const;
export type CompanyLocationKind = (typeof COMPANY_LOCATION_KINDS)[number];

export const COMPANY_LOCATION_KIND_LABELS: Record<CompanyLocationKind, string> = {
  headquarters: "Headquarters",
  pickup: "Pickup Location",
  delivery: "Delivery Location",
  warehouse: "Warehouse Location",
};

export type CompanyPaymentRisk = "low" | "medium" | "high";

export const COMPANY_PAYMENT_RISK_LABELS: Record<CompanyPaymentRisk, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export interface CompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface CompanyContact {
  id: string;
  role: CompanyContactRole;
  name: string;
  position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  extension?: string;
}

export interface CompanyLocation {
  id: string;
  kind: CompanyLocationKind;
  name: string;
  address: CompanyAddress;
  phone?: string;
  hours?: string;
  notes?: string;
}

export interface CompanyDocument {
  id: string;
  type: CompanyDocumentType;
  name: string;
  uploadedAt: string;
  status: CompanyDocumentStatus;
}

export interface CompanyNote {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface CompanyTimelineEvent {
  id: string;
  label: string;
  detail?: string;
  occurredAt: string;
  category: "load" | "payment" | "document" | "contact" | "alert" | "note" | "location";
}

export interface DirectoryCompany extends TenantEntity {
  id: string;
  name: string;
  type: CompanyType;
  status: CompanyStatus;
  logoUrl?: string;
  mcNumber?: string;
  dotNumber?: string;
  scac?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: CompanyAddress;
  paymentTerms?: string;
  outstandingBalance?: number;
  totalRevenue?: number;
  avgPaymentDays?: number;
  lastPaymentAt?: string;
  frequentlyUsed?: boolean;
  paymentRisk?: CompanyPaymentRisk;
  claimsCount?: number;
  averageDetentionHours?: number;
  averageLoadValue?: number;
  preferredLanes?: string[];
  performanceScore?: number;
  linkedBrokerId?: string;
  linkedCustomerId?: string;
  notes?: string;
  contacts: CompanyContact[];
  locations: CompanyLocation[];
  documents: CompanyDocument[];
  noteEntries: CompanyNote[];
  timeline: CompanyTimelineEvent[];
}
