export const PORTAL_ROLES = [
  "company_admin",
  "dispatcher",
  "shipping",
  "receiving",
  "accounting",
  "read_only",
] as const;

export type PortalRole = (typeof PORTAL_ROLES)[number];

export const PORTAL_ROLE_LABELS: Record<PortalRole, string> = {
  company_admin: "Company Admin",
  dispatcher: "Dispatcher",
  shipping: "Shipping",
  receiving: "Receiving",
  accounting: "Accounting",
  read_only: "Read Only",
};

export type PortalCompanyType = "broker" | "shipper";

export type PortalPermission =
  | "view_dashboard"
  | "view_loads"
  | "create_load_request"
  | "cancel_load_request"
  | "duplicate_load"
  | "download_rate_con"
  | "view_tracking"
  | "replay_trip"
  | "view_documents"
  | "upload_documents"
  | "download_documents"
  | "view_invoices"
  | "view_messages"
  | "send_messages"
  | "view_reports"
  | "manage_company_profile"
  | "manage_users";

export type PortalNavId =
  | "dashboard"
  | "loads"
  | "tracking"
  | "documents"
  | "invoices"
  | "messages"
  | "reports"
  | "profile";

export type PortalCompany = {
  id: string;
  name: string;
  type: PortalCompanyType;
  linkedBrokerId?: string;
  linkedCustomerId?: string;
  directoryCompanyId?: string;
  email: string;
  phone: string;
  website?: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  preferredRequirements: string[];
};

export type PortalUser = {
  id: string;
  companyId: string;
  email: string;
  password: string;
  name: string;
  role: PortalRole;
  phone?: string;
  title?: string;
  active: boolean;
};

export type PortalLoadRequestStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "cancelled"
  | "completed";

export type PortalLoadRequest = {
  id: string;
  companyId: string;
  createdByUserId: string;
  reference: string;
  status: PortalLoadRequestStatus;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: string;
  deliveryDate: string;
  commodity: string;
  equipmentType: string;
  weight?: number;
  pieces?: number;
  notes?: string;
  linkedLoadId?: string;
  rate?: number;
  createdAt: string;
  updatedAt: string;
};

export type PortalMessageThread = {
  id: string;
  companyId: string;
  department: "dispatch" | "billing" | "safety";
  subject: string;
  unread: number;
  updatedAt: string;
  messages: PortalMessage[];
};

export type PortalMessage = {
  id: string;
  threadId: string;
  sender: "portal" | "carrier";
  senderName: string;
  body: string;
  sentAt: string;
};

export type PortalNotificationKind =
  | "driver_assigned"
  | "driver_changed"
  | "pickup_complete"
  | "delivery_complete"
  | "pod_uploaded"
  | "invoice_ready"
  | "payment_received";

export type PortalNotification = {
  id: string;
  companyId: string;
  kind: PortalNotificationKind;
  title: string;
  body: string;
  loadReference?: string;
  createdAt: string;
  read: boolean;
};

export type PortalDocumentKind =
  | "pod"
  | "bol"
  | "invoice"
  | "rate_con"
  | "temp_log"
  | "photo"
  | "revised_rc"
  | "pickup_docs"
  | "delivery_docs";

export type PortalDocument = {
  id: string;
  companyId: string;
  loadReference?: string;
  kind: PortalDocumentKind;
  name: string;
  status: "available" | "awaiting_review" | "uploaded";
  uploadedAt: string;
  sizeLabel: string;
};

export type PortalSession = {
  userId: string;
  companyId: string;
  email: string;
  name: string;
  role: PortalRole;
  companyName: string;
  companyType: PortalCompanyType;
  linkedBrokerId?: string;
  linkedCustomerId?: string;
  directoryCompanyId?: string;
  pending2FA?: boolean;
  authenticatedAt: string;
};

export type PortalAuthPhase = "anonymous" | "pending_2fa" | "authenticated";
