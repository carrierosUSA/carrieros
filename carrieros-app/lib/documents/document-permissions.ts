import type { CarrierOSRole } from "@/lib/auth/session";
import type { CarrierDocument } from "@/lib/types/documents";

export type DocumentPermissionAction =
  | "view"
  | "upload"
  | "download"
  | "preview"
  | "share"
  | "rename"
  | "move"
  | "merge"
  | "print"
  | "delete"
  | "restore"
  | "apply_ocr"
  | "view_audit"
  | "view_versions";

export type DocumentPermissionResult = {
  allowed: boolean;
  reason?: string;
};

const FULL: DocumentPermissionAction[] = [
  "view",
  "upload",
  "download",
  "preview",
  "share",
  "rename",
  "move",
  "merge",
  "print",
  "delete",
  "restore",
  "apply_ocr",
  "view_audit",
  "view_versions",
];

const ROLE_PERMISSIONS: Record<CarrierOSRole, DocumentPermissionAction[]> = {
  super_admin: FULL,
  owner: FULL,
  dispatcher: [
    "view",
    "upload",
    "download",
    "preview",
    "share",
    "rename",
    "move",
    "print",
    "apply_ocr",
    "view_audit",
    "view_versions",
  ],
  safety: [
    "view",
    "upload",
    "download",
    "preview",
    "rename",
    "print",
    "apply_ocr",
    "view_audit",
    "view_versions",
  ],
  accounting: [
    "view",
    "upload",
    "download",
    "preview",
    "share",
    "print",
    "view_audit",
    "view_versions",
  ],
  accountant: [
    "view",
    "upload",
    "download",
    "preview",
    "share",
    "print",
    "view_audit",
    "view_versions",
  ],
  maintenance: [
    "view",
    "upload",
    "download",
    "preview",
    "rename",
    "print",
    "apply_ocr",
    "view_versions",
  ],
  fleet_manager: [
    "view",
    "upload",
    "download",
    "preview",
    "rename",
    "print",
    "apply_ocr",
    "view_versions",
  ],
  mechanic: ["view", "upload", "download", "preview", "print"],
  driver: ["view", "upload", "download", "preview"],
  broker: ["view", "download", "preview"],
  shipper: ["view", "download", "preview", "upload"],
  customer: ["view", "download", "preview"],
  read_only: ["view", "download", "preview", "view_versions"],
};

export function checkDocumentPermission(
  role: CarrierOSRole,
  action: DocumentPermissionAction,
  document?: CarrierDocument,
): DocumentPermissionResult {
  const allowedActions = ROLE_PERMISSIONS[role] ?? [];

  if (!allowedActions.includes(action)) {
    return {
      allowed: false,
      reason: `Your role (${role.replace("_", " ")}) cannot ${action.replace("_", " ")} documents`,
    };
  }

  if (document?.status === "deleted" && action !== "restore" && action !== "view" && action !== "view_audit" && action !== "view_versions") {
    return {
      allowed: false,
      reason: "Document is in trash — restore it first",
    };
  }

  if (document?.status === "missing" && (action === "download" || action === "print" || action === "share")) {
    return {
      allowed: false,
      reason: "Document file is missing — upload a file first",
    };
  }

  if (action === "merge") {
    return {
      allowed: false,
      reason: "Select two or more PDFs to merge",
    };
  }

  return { allowed: true };
}

export function getRolePermissionLabels(role: CarrierOSRole): string[] {
  return (ROLE_PERMISSIONS[role] ?? []).map((action) =>
    action
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  );
}

export const DOCUMENT_ROLE_BADGE_COPY: Record<string, string> =
  {
    encrypted: "Encrypted at rest (architecture ready for S3/GCS)",
    soft_delete: "Soft delete — recoverable from trash",
    audit: "Every action is written to the audit log",
    versions: "Prior versions kept for compliance",
  };
