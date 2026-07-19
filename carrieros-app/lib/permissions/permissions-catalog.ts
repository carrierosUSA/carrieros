import type { PermissionDef, PermissionId } from "@/lib/permissions/types";

function page(
  resource: string,
  label: string,
  description?: string,
): PermissionDef {
  return {
    id: `page.${resource}.view`,
    type: "page",
    resource,
    action: "view",
    label,
    description,
  };
}

function button(
  resource: string,
  action: PermissionDef["action"],
  label: string,
  description?: string,
): PermissionDef {
  return {
    id: `button.${resource}.${action}`,
    type: "button",
    resource,
    action,
    label,
    description,
  };
}

function document(
  resource: string,
  action: PermissionDef["action"],
  label: string,
  description?: string,
): PermissionDef {
  return {
    id: `document.${resource}.${action}`,
    type: "document",
    resource,
    action,
    label,
    description,
  };
}

export const PAGE_PERMISSIONS: PermissionDef[] = [
  page("loads", "Dispatch / Loads", "View /loads"),
  page("finance", "Finance", "View /finance"),
  page("payroll", "Payroll", "View /payroll"),
  page("compliance", "Compliance", "View /compliance"),
  page("fleet", "Fleet", "View /fleet"),
  page("drivers", "Drivers", "View /drivers"),
  page("documents", "Documents", "View /documents"),
  page("settings", "Settings", "View /settings"),
  page("workflows", "Workflows", "View /workflows"),
  page("brokers", "Brokers", "View /brokers"),
  page("companies", "Companies", "View /companies"),
  page("portal", "Customer Portal", "View /portal"),
  page("driver", "Driver App", "View /driver"),
  page("analytics", "Reports", "View /analytics"),
  page("marketplace", "Marketplace", "View /marketplace"),
  page("command", "Command Center", "View /"),
];

export const BUTTON_PERMISSIONS: PermissionDef[] = [
  button("loads", "create", "Create load", "New load / Create Load"),
  button("loads", "edit", "Edit load"),
  button("loads", "delete", "Delete / cancel load"),
  button("loads", "assign", "Assign driver", "loads.assign_driver"),
  button("loads", "export", "Export loads"),
  button("finance", "create", "Create invoice", "finance.create_invoice"),
  button("finance", "edit", "Edit invoice / payment"),
  button("finance", "approve", "Approve payment"),
  button("finance", "export", "Export finance reports"),
  button("payroll", "create", "Run payroll"),
  button("payroll", "approve", "Approve payroll"),
  button("payroll", "export", "Export payroll"),
  button("documents", "upload", "Upload document"),
  button("documents", "delete", "Delete document"),
  button("documents", "share", "Share document"),
  button("documents", "export", "Export documents"),
  button("compliance", "create", "Report accident", "compliance.report_accident"),
  button("compliance", "edit", "Edit compliance record"),
  button("compliance", "approve", "Approve compliance item"),
  button("compliance", "export", "Export compliance report"),
  button("fleet", "create", "Add truck / trailer"),
  button("fleet", "edit", "Edit fleet asset"),
  button("fleet", "manage", "Schedule maintenance"),
  button("drivers", "create", "Add driver"),
  button("drivers", "edit", "Edit driver"),
  button("drivers", "assign", "Assign driver to load"),
  button("brokers", "create", "Add broker"),
  button("brokers", "edit", "Edit broker"),
  button("companies", "create", "Add company"),
  button("companies", "edit", "Edit company"),
  button("workflows", "edit", "Edit workflows", "workflows.edit"),
  button("workflows", "manage", "Manage workflow runs"),
  button("settings", "manage", "Manage roles & permissions"),
  button("settings", "edit", "Edit workspace settings"),
  button("analytics", "export", "Export reports"),
];

const DOC_CATEGORIES = [
  { id: "rate_con", label: "Rate confirmation" },
  { id: "pod", label: "Proof of delivery" },
  { id: "bol", label: "Bill of lading" },
  { id: "invoice", label: "Invoice" },
  { id: "ssn_secured", label: "SSN / secured PII" },
  { id: "medical", label: "Medical / DOT physical" },
  { id: "cdl", label: "CDL / license" },
  { id: "insurance", label: "Insurance" },
  { id: "maintenance", label: "Maintenance records" },
  { id: "accident", label: "Accident reports" },
] as const;

const DOC_ACTIONS = [
  { action: "view" as const, label: "View" },
  { action: "download" as const, label: "Download" },
  { action: "upload" as const, label: "Upload" },
  { action: "delete" as const, label: "Delete" },
  { action: "share" as const, label: "Share" },
];

export const DOCUMENT_PERMISSIONS: PermissionDef[] = DOC_CATEGORIES.flatMap(
  (cat) =>
    DOC_ACTIONS.map((a) =>
      document(
        cat.id,
        a.action,
        `${cat.label}: ${a.label}`,
        `${a.label} ${cat.label.toLowerCase()} documents`,
      ),
    ),
);

export const ALL_PERMISSIONS: PermissionDef[] = [
  ...PAGE_PERMISSIONS,
  ...BUTTON_PERMISSIONS,
  ...DOCUMENT_PERMISSIONS,
];

export const ALL_PERMISSION_IDS: PermissionId[] = ALL_PERMISSIONS.map((p) => p.id);

const BY_ID = new Map(ALL_PERMISSIONS.map((p) => [p.id, p]));

export function getPermissionDef(id: PermissionId): PermissionDef | undefined {
  return BY_ID.get(id);
}

export function permissionsByType(type: PermissionDef["type"]): PermissionDef[] {
  return ALL_PERMISSIONS.filter((p) => p.type === type);
}

/** View-only subset used by Read Only role */
export function viewOnlyPermissionIds(): PermissionId[] {
  return ALL_PERMISSIONS.filter((p) => {
    if (p.type === "page") return p.action === "view";
    if (p.type === "document") {
      return p.action === "view" || p.action === "download";
    }
    return false;
  }).map((p) => p.id);
}
