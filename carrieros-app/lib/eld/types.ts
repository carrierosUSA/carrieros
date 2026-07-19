/**
 * Universal ELD Connection Request domain types.
 * Catalog is static; connection + request state lives in the client store.
 */

export type EldDataType =
  | "live_gps"
  | "vehicle_mileage"
  | "state_mileage"
  | "driver_hos"
  | "driver_status"
  | "engine_hours"
  | "fuel_data"
  | "fault_codes"
  | "truck_information"
  | "trailer_information"
  | "dash_camera_events";

export type EldConnectionStatus =
  | "connected"
  | "available"
  | "partnership_required"
  | "api_restricted"
  | "no_public_api"
  | "under_review"
  | "not_yet_supported";

/** High-level buckets for filters and messaging — never a dead end. */
export type EldSupportCategory =
  | "technically_supported"
  | "waiting_eld_approval"
  | "unsupported_no_api"
  | "requested_by_carriers";

export type EldRequestStatus =
  | "submitted"
  | "carrier_contacted_eld"
  | "waiting_for_response"
  | "eld_responded"
  | "documents_received"
  | "technical_review"
  | "development_started"
  | "testing"
  | "connected"
  | "rejected";

export type EldRejectionReason =
  | "no_public_api"
  | "eld_declined_partnership"
  | "incomplete_documentation"
  | "security_compliance"
  | "duplicate_integration"
  | "low_demand"
  | "technical_incompatibility"
  | "carrier_withdrew";

export type EldNegotiationStatus =
  | "not_started"
  | "outreach_sent"
  | "in_discussion"
  | "docs_pending"
  | "approved"
  | "blocked"
  | "declined";

export type EldProviderId = string;

export type EldCatalogProvider = {
  id: EldProviderId;
  name: string;
  initials: string;
  description: string;
  /** Default catalog status before runtime overrides. */
  status: EldConnectionStatus;
  supportCategory: EldSupportCategory;
  dataTypes: EldDataType[];
  /** Plain-language reason when not connectable today. */
  unavailableReason?: string;
  /** ISO date of last partnership / API verification. */
  lastVerificationDate: string;
  /** Link into Integration Center when shared. */
  integrationProviderId?:
    | "samsara"
    | "motive"
    | "geotab"
    | "omnitracs";
  docsUrl?: string;
  contactEmail?: string;
  /** Relative API difficulty 1–5 for admin priority. */
  apiDifficulty: 1 | 2 | 3 | 4 | 5;
  /** Business value 1–5 for admin priority. */
  businessValue: 1 | 2 | 3 | 4 | 5;
  /** 0 = no API, 0.5 = restricted/partner, 1 = public API. */
  apiAvailabilityScore: number;
  fictional?: boolean;
};

export type EldConnectionRuntime = {
  providerId: EldProviderId;
  status: EldConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
};

export type EldUploadedDoc = {
  id: string;
  fileName: string;
  uploadedAt: string;
  note?: string;
};

export type EldCallNote = {
  id: string;
  providerId: EldProviderId;
  requestId?: string;
  contactedAt: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes: string;
  createdAt: string;
};

export type EldEldContact = {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
};

export type EldIntegrationRequest = {
  id: string;
  providerId: EldProviderId;
  providerName: string;
  carrierCompany: string;
  mcNumber: string;
  dotNumber: string;
  eldAccountNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  truckCount: number;
  featuresNeeded: EldDataType[];
  apiDocuments: EldUploadedDoc[];
  eldRepresentative: EldEldContact;
  notes: string;
  status: EldRequestStatus;
  rejectionReason?: EldRejectionReason;
  rejectionDetail?: string;
  negotiationStatus: EldNegotiationStatus;
  assignedTeammate?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: EldRequestStatus;
    at: string;
    note?: string;
  }>;
};

export type EldFallbackImportKind =
  | "csv_import"
  | "excel_import"
  | "manual_mileage"
  | "fuel_report"
  | "scheduled_email"
  | "eld_report";

export type EldFallbackImport = {
  id: string;
  kind: EldFallbackImportKind;
  fileName: string;
  providerId?: EldProviderId;
  note?: string;
  linkedToIfta: boolean;
  importedAt: string;
};

export type EldStoreState = {
  connections: Record<EldProviderId, EldConnectionRuntime>;
  requests: EldIntegrationRequest[];
  callNotes: EldCallNote[];
  fallbackImports: EldFallbackImport[];
  updatedAt: string;
};

export const ELD_DATA_TYPE_LABELS: Record<EldDataType, string> = {
  live_gps: "Live GPS",
  vehicle_mileage: "Vehicle Mileage",
  state_mileage: "State Mileage",
  driver_hos: "Driver HOS",
  driver_status: "Driver Status",
  engine_hours: "Engine Hours",
  fuel_data: "Fuel Data",
  fault_codes: "Fault Codes",
  truck_information: "Truck Information",
  trailer_information: "Trailer Information",
  dash_camera_events: "Dash Camera Events",
};

export const ELD_STATUS_LABELS: Record<EldConnectionStatus, string> = {
  connected: "Connected",
  available: "Available to Connect",
  partnership_required: "Partnership Required",
  api_restricted: "API Restricted",
  no_public_api: "No Public API",
  under_review: "Under Review",
  not_yet_supported: "Not Yet Supported",
};

export const ELD_SUPPORT_CATEGORY_LABELS: Record<EldSupportCategory, string> = {
  technically_supported: "Technically supported",
  waiting_eld_approval: "Waiting for ELD approval",
  unsupported_no_api: "Unsupported (no API)",
  requested_by_carriers: "Requested by carriers",
};

export const ELD_REQUEST_STATUS_LABELS: Record<EldRequestStatus, string> = {
  submitted: "Submitted",
  carrier_contacted_eld: "Carrier Contacted ELD",
  waiting_for_response: "Waiting for Response",
  eld_responded: "ELD Responded",
  documents_received: "Documents Received",
  technical_review: "Technical Review",
  development_started: "Development Started",
  testing: "Testing",
  connected: "Connected",
  rejected: "Rejected",
};

export const ELD_REJECTION_REASON_LABELS: Record<EldRejectionReason, string> = {
  no_public_api: "No public API available",
  eld_declined_partnership: "ELD declined partnership",
  incomplete_documentation: "Incomplete documentation",
  security_compliance: "Security or compliance concerns",
  duplicate_integration: "Already covered by an existing integration",
  low_demand: "Low demand — not prioritized",
  technical_incompatibility: "Technical incompatibility",
  carrier_withdrew: "Carrier withdrew the request",
};

export const ELD_NEGOTIATION_STATUS_LABELS: Record<
  EldNegotiationStatus,
  string
> = {
  not_started: "Not started",
  outreach_sent: "Outreach sent",
  in_discussion: "In discussion",
  docs_pending: "Docs pending",
  approved: "Approved",
  blocked: "Blocked",
  declined: "Declined",
};

export const ELD_REQUEST_STATUS_ORDER: EldRequestStatus[] = [
  "submitted",
  "carrier_contacted_eld",
  "waiting_for_response",
  "eld_responded",
  "documents_received",
  "technical_review",
  "development_started",
  "testing",
  "connected",
];

export const ALL_ELD_DATA_TYPES: EldDataType[] = [
  "live_gps",
  "vehicle_mileage",
  "state_mileage",
  "driver_hos",
  "driver_status",
  "engine_hours",
  "fuel_data",
  "fault_codes",
  "truck_information",
  "trailer_information",
  "dash_camera_events",
];
