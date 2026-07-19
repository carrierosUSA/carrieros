import type { PortalPermission, PortalRole } from "@/lib/portal/types";
import { PORTAL_ROLE_LABELS } from "@/lib/portal/types";

const ALL: PortalPermission[] = [
  "view_dashboard",
  "view_loads",
  "create_load_request",
  "cancel_load_request",
  "duplicate_load",
  "download_rate_con",
  "view_tracking",
  "replay_trip",
  "view_documents",
  "upload_documents",
  "download_documents",
  "view_invoices",
  "view_messages",
  "send_messages",
  "view_reports",
  "manage_company_profile",
  "manage_users",
];

const ROLE_PERMISSIONS: Record<PortalRole, PortalPermission[]> = {
  company_admin: ALL,
  dispatcher: [
    "view_dashboard",
    "view_loads",
    "create_load_request",
    "cancel_load_request",
    "duplicate_load",
    "download_rate_con",
    "view_tracking",
    "replay_trip",
    "view_documents",
    "upload_documents",
    "download_documents",
    "view_invoices",
    "view_messages",
    "send_messages",
    "view_reports",
  ],
  shipping: [
    "view_dashboard",
    "view_loads",
    "create_load_request",
    "cancel_load_request",
    "duplicate_load",
    "download_rate_con",
    "view_tracking",
    "view_documents",
    "upload_documents",
    "download_documents",
    "view_messages",
    "send_messages",
    "view_reports",
  ],
  receiving: [
    "view_dashboard",
    "view_loads",
    "view_tracking",
    "view_documents",
    "upload_documents",
    "download_documents",
    "view_messages",
    "send_messages",
  ],
  accounting: [
    "view_dashboard",
    "view_loads",
    "download_rate_con",
    "view_documents",
    "download_documents",
    "view_invoices",
    "view_messages",
    "send_messages",
    "view_reports",
  ],
  read_only: [
    "view_dashboard",
    "view_loads",
    "download_rate_con",
    "view_tracking",
    "view_documents",
    "download_documents",
    "view_invoices",
    "view_messages",
    "view_reports",
  ],
};

const PERMISSION_LABELS: Record<PortalPermission, string> = {
  view_dashboard: "View dashboard",
  view_loads: "View loads",
  create_load_request: "Create load request",
  cancel_load_request: "Cancel load request",
  duplicate_load: "Duplicate previous load",
  download_rate_con: "Download rate confirmation",
  view_tracking: "View tracking",
  replay_trip: "Replay trip",
  view_documents: "View documents",
  upload_documents: "Upload documents",
  download_documents: "Download documents",
  view_invoices: "View invoices",
  view_messages: "View messages",
  send_messages: "Send messages",
  view_reports: "View reports",
  manage_company_profile: "Manage company profile",
  manage_users: "Manage users",
};

export function canPortal(
  role: PortalRole | undefined,
  permission: PortalPermission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function portalPermissionDeniedReason(
  role: PortalRole | undefined,
  permission: PortalPermission,
): string | null {
  if (canPortal(role, permission)) return null;
  const roleLabel = role ? PORTAL_ROLE_LABELS[role] : "Your role";
  const action = PERMISSION_LABELS[permission];
  return `${roleLabel} cannot ${action.toLowerCase()}. Ask a Company Admin to change your access.`;
}

export function listPortalPermissions(role: PortalRole): PortalPermission[] {
  return ROLE_PERMISSIONS[role];
}
