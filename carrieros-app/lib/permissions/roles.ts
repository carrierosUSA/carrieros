import {
  ALL_PERMISSION_IDS,
  BUTTON_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PAGE_PERMISSIONS,
  viewOnlyPermissionIds,
} from "@/lib/permissions/permissions-catalog";
import type {
  BuiltInRoleId,
  PermissionId,
  RoleDefinition,
} from "@/lib/permissions/types";

export const BUILT_IN_ROLE_IDS: BuiltInRoleId[] = [
  "super_admin",
  "owner",
  "dispatcher",
  "accounting",
  "safety",
  "maintenance",
  "driver",
  "broker",
  "shipper",
  "customer",
  "read_only",
];

const ROLE_META: Record<
  BuiltInRoleId,
  { name: string; description: string; ssoGroupHint: string }
> = {
  super_admin: {
    name: "Super Admin",
    description: "Full platform access including roles, SSO, and audit.",
    ssoGroupHint: "carrieros-super-admins",
  },
  owner: {
    name: "Owner",
    description: "Carrier owner with full operational and financial access.",
    ssoGroupHint: "carrieros-owners",
  },
  dispatcher: {
    name: "Dispatcher",
    description: "Load board, drivers, brokers, and day-to-day operations.",
    ssoGroupHint: "carrieros-dispatchers",
  },
  accounting: {
    name: "Accounting",
    description: "Invoices, payments, payroll, and financial exports.",
    ssoGroupHint: "carrieros-accounting",
  },
  safety: {
    name: "Safety",
    description: "Compliance, driver docs, accidents, and safety exports.",
    ssoGroupHint: "carrieros-safety",
  },
  maintenance: {
    name: "Maintenance",
    description: "Fleet assets, shop work, and maintenance documents.",
    ssoGroupHint: "carrieros-maintenance",
  },
  driver: {
    name: "Driver",
    description: "Driver app, assigned loads, and upload POD / docs.",
    ssoGroupHint: "carrieros-drivers",
  },
  broker: {
    name: "Broker",
    description: "Limited broker-facing load and document visibility.",
    ssoGroupHint: "carrieros-brokers",
  },
  shipper: {
    name: "Shipper",
    description: "Shipper portal loads, tracking, and document download.",
    ssoGroupHint: "carrieros-shippers",
  },
  customer: {
    name: "Customer",
    description: "Customer portal view of loads, invoices, and docs.",
    ssoGroupHint: "carrieros-customers",
  },
  read_only: {
    name: "Read Only",
    description: "View pages and download non-sensitive documents only.",
    ssoGroupHint: "carrieros-read-only",
  },
};

function pageIds(...resources: string[]): PermissionId[] {
  return PAGE_PERMISSIONS.filter((p) => resources.includes(p.resource)).map(
    (p) => p.id,
  );
}

function buttonIds(
  ...pairs: Array<{ resource: string; actions?: string[] }>
): PermissionId[] {
  return BUTTON_PERMISSIONS.filter((p) =>
    pairs.some(
      (pair) =>
        pair.resource === p.resource &&
        (!pair.actions || pair.actions.includes(p.action)),
    ),
  ).map((p) => p.id);
}

function documentIds(
  categories: string[],
  actions: string[],
): PermissionId[] {
  return DOCUMENT_PERMISSIONS.filter(
    (p) => categories.includes(p.resource) && actions.includes(p.action),
  ).map((p) => p.id);
}

const OPS_DOCS = ["rate_con", "pod", "bol", "invoice", "insurance"];
const SAFETY_DOCS = [
  "medical",
  "cdl",
  "accident",
  "insurance",
  "pod",
  "bol",
];
const FINANCE_DOCS = ["rate_con", "invoice", "pod", "bol"];
const FLEET_DOCS = ["maintenance", "insurance"];
const SENSITIVE = ["ssn_secured", "medical"];

function defaultMatrix(roleId: BuiltInRoleId): PermissionId[] {
  switch (roleId) {
    case "super_admin":
    case "owner":
      return [...ALL_PERMISSION_IDS];

    case "dispatcher":
      return [
        ...pageIds(
          "command",
          "loads",
          "drivers",
          "fleet",
          "documents",
          "brokers",
          "companies",
          "workflows",
        ),
        ...buttonIds(
          { resource: "loads" },
          { resource: "drivers", actions: ["edit", "assign"] },
          { resource: "documents", actions: ["upload", "share"] },
          { resource: "brokers", actions: ["edit"] },
          { resource: "companies", actions: ["edit"] },
          { resource: "workflows", actions: ["edit", "manage"] },
        ),
        ...documentIds(OPS_DOCS, ["view", "download", "upload", "share"]),
      ];

    case "accounting":
      return [
        ...pageIds(
          "command",
          "finance",
          "payroll",
          "documents",
          "brokers",
          "companies",
          "loads",
          "analytics",
        ),
        ...buttonIds(
          { resource: "finance" },
          { resource: "payroll" },
          { resource: "documents", actions: ["upload", "share", "export"] },
          { resource: "analytics", actions: ["export"] },
          { resource: "loads", actions: ["export"] },
        ),
        ...documentIds(FINANCE_DOCS, ["view", "download", "upload", "share"]),
      ];

    case "safety":
      return [
        ...pageIds(
          "command",
          "compliance",
          "drivers",
          "documents",
          "analytics",
        ),
        ...buttonIds(
          { resource: "compliance" },
          { resource: "drivers", actions: ["edit"] },
          { resource: "documents", actions: ["upload", "share", "export"] },
          { resource: "analytics", actions: ["export"] },
        ),
        ...documentIds(SAFETY_DOCS, ["view", "download", "upload", "share"]),
        ...documentIds(SENSITIVE, ["view", "download", "upload"]),
      ];

    case "maintenance":
      return [
        ...pageIds("command", "fleet", "documents", "marketplace"),
        ...buttonIds(
          { resource: "fleet" },
          { resource: "documents", actions: ["upload"] },
        ),
        ...documentIds(FLEET_DOCS, ["view", "download", "upload"]),
      ];

    case "driver":
      return [
        ...pageIds("driver", "loads", "documents"),
        ...buttonIds({ resource: "documents", actions: ["upload"] }),
        ...documentIds(
          ["pod", "bol", "rate_con", "cdl", "medical"],
          ["view", "download", "upload"],
        ),
      ];

    case "broker":
      return [
        ...pageIds("portal", "loads", "documents"),
        ...documentIds(
          ["rate_con", "pod", "bol", "invoice"],
          ["view", "download"],
        ),
      ];

    case "shipper":
      return [
        ...pageIds("portal", "loads", "documents"),
        ...buttonIds({ resource: "loads", actions: ["create"] }),
        ...documentIds(["rate_con", "pod", "bol"], ["view", "download", "upload"]),
      ];

    case "customer":
      return [
        ...pageIds("portal", "loads", "documents", "finance"),
        ...documentIds(
          ["rate_con", "pod", "invoice"],
          ["view", "download"],
        ),
      ];

    case "read_only":
      return viewOnlyPermissionIds().filter(
        (id) => !id.includes("ssn_secured") && !id.includes("medical"),
      );
  }
}

export function getDefaultPermissions(roleId: BuiltInRoleId): PermissionId[] {
  return defaultMatrix(roleId);
}

export function getBuiltInRoles(): RoleDefinition[] {
  return BUILT_IN_ROLE_IDS.map((id) => ({
    id,
    name: ROLE_META[id].name,
    description: ROLE_META[id].description,
    builtIn: true,
    ssoGroupHint: ROLE_META[id].ssoGroupHint,
    permissionIds: getDefaultPermissions(id),
  }));
}

export function getBuiltInRoleMeta(roleId: BuiltInRoleId) {
  return ROLE_META[roleId];
}

export function isBuiltInRoleId(id: string): id is BuiltInRoleId {
  return (BUILT_IN_ROLE_IDS as string[]).includes(id);
}

/** Map legacy session roles onto enterprise role ids */
export function mapSessionRoleToEnterprise(
  sessionRole: string,
): BuiltInRoleId {
  switch (sessionRole) {
    case "super_admin":
      return "super_admin";
    case "owner":
      return "owner";
    case "dispatcher":
      return "dispatcher";
    case "accountant":
    case "accounting":
      return "accounting";
    case "safety":
      return "safety";
    case "mechanic":
    case "maintenance":
    case "fleet_manager":
      return "maintenance";
    case "driver":
      return "driver";
    case "broker":
      return "broker";
    case "shipper":
      return "shipper";
    case "customer":
      return "customer";
    case "read_only":
      return "read_only";
    default:
      return "read_only";
  }
}

export function roleDisplayName(roleId: string): string {
  if (isBuiltInRoleId(roleId)) return ROLE_META[roleId].name;
  return roleId
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
