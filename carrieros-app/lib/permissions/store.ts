import {
  getBuiltInRoles,
  getDefaultPermissions,
  isBuiltInRoleId,
  mapSessionRoleToEnterprise,
} from "@/lib/permissions/roles";
import type {
  AuditEntry,
  BuiltInRoleId,
  DemoUser,
  PermissionId,
  PermissionsStoreState,
  RoleDefinition,
  RoleId,
  UserRoleAssignment,
} from "@/lib/permissions/types";

const STORAGE_KEY = "carrieros.enterprise.permissions.v1";

export const DEMO_USERS: DemoUser[] = [
  {
    id: "alpha-owner",
    name: "Alpha Owner",
    email: "owner@alphafreight.demo",
    title: "Owner",
  },
  {
    id: "user-dispatch-1",
    name: "Jordan Lee",
    email: "jordan@alphafreight.demo",
    title: "Lead Dispatcher",
  },
  {
    id: "user-accounting-1",
    name: "Priya Shah",
    email: "priya@alphafreight.demo",
    title: "Controller",
  },
  {
    id: "user-safety-1",
    name: "Marcus Cole",
    email: "marcus@alphafreight.demo",
    title: "Safety Manager",
  },
  {
    id: "user-maint-1",
    name: "Elena Ruiz",
    email: "elena@alphafreight.demo",
    title: "Shop Lead",
  },
  {
    id: "user-driver-1",
    name: "Sam Okonkwo",
    email: "sam@alphafreight.demo",
    title: "Company Driver",
  },
  {
    id: "user-readonly-1",
    name: "Casey Nguyen",
    email: "casey@alphafreight.demo",
    title: "Auditor (Read Only)",
  },
];

const DEFAULT_ASSIGNMENTS: UserRoleAssignment[] = [
  { userId: "alpha-owner", roleId: "owner" },
  { userId: "user-dispatch-1", roleId: "dispatcher" },
  { userId: "user-accounting-1", roleId: "accounting" },
  { userId: "user-safety-1", roleId: "safety" },
  { userId: "user-maint-1", roleId: "maintenance" },
  { userId: "user-driver-1", roleId: "driver" },
  { userId: "user-readonly-1", roleId: "read_only" },
];

function seedAuditLog(): AuditEntry[] {
  const now = Date.now();
  const hours = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

  const rows: Omit<AuditEntry, "id">[] = [
    {
      timestamp: hours(0.5),
      actorUserId: "user-dispatch-1",
      actorName: "Jordan Lee",
      role: "Dispatcher",
      action: "create",
      resource: "loads",
      resourceId: "LD-4821",
      details: "Created load CHI → DAL",
      ip: "10.0.12.41",
    },
    {
      timestamp: hours(1),
      actorUserId: "user-dispatch-1",
      actorName: "Jordan Lee",
      role: "Dispatcher",
      action: "assign",
      resource: "loads",
      resourceId: "LD-4821",
      details: "Assigned driver Sam Okonkwo",
      ip: "10.0.12.41",
    },
    {
      timestamp: hours(1.5),
      actorUserId: "alpha-owner",
      actorName: "Alpha Owner",
      role: "Owner",
      action: "edit",
      resource: "settings.roles",
      details: "Reviewed dispatcher permission matrix",
      ip: "10.0.12.10",
    },
    {
      timestamp: hours(2),
      actorUserId: "user-accounting-1",
      actorName: "Priya Shah",
      role: "Accounting",
      action: "create",
      resource: "finance.invoice",
      resourceId: "INV-1092",
      details: "Created invoice for LD-4710",
      ip: "10.0.14.22",
    },
    {
      timestamp: hours(3),
      actorUserId: "user-accounting-1",
      actorName: "Priya Shah",
      role: "Accounting",
      action: "export",
      resource: "finance",
      details: "Exported AR aging PDF",
      ip: "10.0.14.22",
    },
    {
      timestamp: hours(4),
      actorUserId: "user-safety-1",
      actorName: "Marcus Cole",
      role: "Safety",
      action: "create",
      resource: "compliance.accident",
      resourceId: "ACC-88",
      details: "Reported minor dock incident",
      ip: "10.0.15.8",
    },
    {
      timestamp: hours(5),
      actorUserId: "user-safety-1",
      actorName: "Marcus Cole",
      role: "Safety",
      action: "upload",
      resource: "documents.medical",
      resourceId: "DOC-med-12",
      details: "Uploaded DOT physical for Sam Okonkwo",
      ip: "10.0.15.8",
    },
    {
      timestamp: hours(6),
      actorUserId: "user-driver-1",
      actorName: "Sam Okonkwo",
      role: "Driver",
      action: "upload",
      resource: "documents.pod",
      resourceId: "DOC-pod-441",
      details: "Uploaded POD for LD-4710",
      ip: "172.20.4.90",
    },
    {
      timestamp: hours(7),
      actorUserId: "user-maint-1",
      actorName: "Elena Ruiz",
      role: "Maintenance",
      action: "manage",
      resource: "fleet",
      resourceId: "TRK-12",
      details: "Scheduled PM service for Truck 12",
      ip: "10.0.16.3",
    },
    {
      timestamp: hours(8),
      actorUserId: "user-dispatch-1",
      actorName: "Jordan Lee",
      role: "Dispatcher",
      action: "edit",
      resource: "loads",
      resourceId: "LD-4702",
      details: "Updated delivery appointment",
      ip: "10.0.12.41",
    },
    {
      timestamp: hours(10),
      actorUserId: "alpha-owner",
      actorName: "Alpha Owner",
      role: "Owner",
      action: "share",
      resource: "documents.rate_con",
      resourceId: "DOC-rc-90",
      details: "Shared rate con with broker contact",
      ip: "10.0.12.10",
    },
    {
      timestamp: hours(12),
      actorUserId: "user-accounting-1",
      actorName: "Priya Shah",
      role: "Accounting",
      action: "approve",
      resource: "payroll",
      resourceId: "PR-2026-07-11",
      details: "Approved weekly payroll run",
      ip: "10.0.14.22",
    },
    {
      timestamp: hours(14),
      actorUserId: "user-readonly-1",
      actorName: "Casey Nguyen",
      role: "Read Only",
      action: "view",
      resource: "finance",
      details: "Viewed finance dashboard",
      ip: "10.0.20.5",
    },
    {
      timestamp: hours(16),
      actorUserId: "user-dispatch-1",
      actorName: "Jordan Lee",
      role: "Dispatcher",
      action: "delete",
      resource: "documents",
      resourceId: "DOC-draft-3",
      details: "Moved draft BOL to trash",
      ip: "10.0.12.41",
    },
    {
      timestamp: hours(18),
      actorUserId: "alpha-owner",
      actorName: "Alpha Owner",
      role: "Owner",
      action: "create",
      resource: "settings.roles",
      resourceId: "role-night-ops",
      details: "Created custom role Night Ops",
      ip: "10.0.12.10",
    },
    {
      timestamp: hours(20),
      actorUserId: "user-safety-1",
      actorName: "Marcus Cole",
      role: "Safety",
      action: "export",
      resource: "compliance",
      details: "Exported CSA summary PDF",
      ip: "10.0.15.8",
    },
    {
      timestamp: hours(22),
      actorUserId: "user-maint-1",
      actorName: "Elena Ruiz",
      role: "Maintenance",
      action: "upload",
      resource: "documents.maintenance",
      resourceId: "DOC-maint-77",
      details: "Uploaded inspection report for Trailer 4",
      ip: "10.0.16.3",
    },
    {
      timestamp: hours(26),
      actorUserId: "user-dispatch-1",
      actorName: "Jordan Lee",
      role: "Dispatcher",
      action: "edit",
      resource: "workflows",
      details: "Edited rate-con follow-up workflow",
      ip: "10.0.12.41",
    },
    {
      timestamp: hours(28),
      actorUserId: "user-accounting-1",
      actorName: "Priya Shah",
      role: "Accounting",
      action: "edit",
      resource: "finance.invoice",
      resourceId: "INV-1088",
      details: "Marked invoice INV-1088 as paid",
      ip: "10.0.14.22",
    },
    {
      timestamp: hours(30),
      actorUserId: "alpha-owner",
      actorName: "Alpha Owner",
      role: "Owner",
      action: "manage",
      resource: "settings.users",
      details: "Assigned Casey Nguyen to Read Only",
      ip: "10.0.12.10",
    },
    {
      timestamp: hours(32),
      actorUserId: "user-driver-1",
      actorName: "Sam Okonkwo",
      role: "Driver",
      action: "view",
      resource: "loads",
      resourceId: "LD-4821",
      details: "Opened assigned load details in driver app",
      ip: "172.20.4.90",
    },
    {
      timestamp: hours(36),
      actorUserId: "user-dispatch-1",
      actorName: "Jordan Lee",
      role: "Dispatcher",
      action: "create",
      resource: "companies",
      resourceId: "CMP-88",
      details: "Added shipper contact for Midwest Foods",
      ip: "10.0.12.41",
    },
    {
      timestamp: hours(40),
      actorUserId: "user-safety-1",
      actorName: "Marcus Cole",
      role: "Safety",
      action: "approve",
      resource: "compliance",
      resourceId: "DRV-med-ok",
      details: "Approved medical clearance for return to duty",
      ip: "10.0.15.8",
    },
    {
      timestamp: hours(44),
      actorUserId: "user-readonly-1",
      actorName: "Casey Nguyen",
      role: "Read Only",
      action: "download",
      resource: "documents.rate_con",
      resourceId: "DOC-rc-90",
      details: "Downloaded rate confirmation for audit sample",
      ip: "10.0.20.5",
    },
    {
      timestamp: hours(48),
      actorUserId: "alpha-owner",
      actorName: "Alpha Owner",
      role: "Owner",
      action: "export",
      resource: "analytics",
      details: "Exported weekly ops report",
      ip: "10.0.12.10",
    },
  ];

  return rows.map((row, index) => ({
    ...row,
    id: `audit-${String(index + 1).padStart(3, "0")}`,
  }));
}

function seedCustomRoles(): RoleDefinition[] {
  return [
    {
      id: "role-night-ops",
      name: "Night Ops",
      description: "After-hours dispatch coverage with limited finance access.",
      builtIn: false,
      ssoGroupHint: "carrieros-night-ops",
      permissionIds: [
        "page.command.view",
        "page.loads.view",
        "page.drivers.view",
        "page.documents.view",
        "page.brokers.view",
        "button.loads.create",
        "button.loads.edit",
        "button.loads.assign",
        "button.documents.upload",
        "document.rate_con.view",
        "document.rate_con.download",
        "document.pod.view",
        "document.pod.download",
        "document.pod.upload",
        "document.bol.view",
        "document.bol.download",
        "document.bol.upload",
      ],
    },
  ];
}

function defaultState(): PermissionsStoreState {
  return {
    customRoles: seedCustomRoles(),
    builtInOverrides: {},
    assignments: DEFAULT_ASSIGNMENTS,
    auditLog: seedAuditLog(),
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

let memoryState: PermissionsStoreState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function readState(): PermissionsStoreState {
  if (memoryState) return memoryState;
  if (!canUseStorage()) {
    memoryState = defaultState();
    return memoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryState = defaultState();
      return memoryState;
    }
    const parsed = JSON.parse(raw) as PermissionsStoreState;
    memoryState = {
      customRoles: parsed.customRoles ?? seedCustomRoles(),
      builtInOverrides: parsed.builtInOverrides ?? {},
      assignments: parsed.assignments ?? DEFAULT_ASSIGNMENTS,
      auditLog: parsed.auditLog?.length ? parsed.auditLog : seedAuditLog(),
    };
    return memoryState;
  } catch {
    memoryState = defaultState();
    return memoryState;
  }
}

function writeState(next: PermissionsStoreState) {
  memoryState = next;
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  notify();
}

export function getPermissionsStore(): PermissionsStoreState {
  return readState();
}

export function subscribePermissionsStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetPermissionsStore() {
  writeState(defaultState());
}

export function listAllRoles(): RoleDefinition[] {
  const state = readState();
  const builtIn = getBuiltInRoles().map((role) => {
    const override = state.builtInOverrides[role.id as BuiltInRoleId];
    if (!override) return role;
    return { ...role, permissionIds: override };
  });
  return [...builtIn, ...state.customRoles];
}

export function getRoleById(roleId: RoleId): RoleDefinition | undefined {
  return listAllRoles().find((role) => role.id === roleId);
}

export function getRolePermissions(roleId: RoleId): PermissionId[] {
  const role = getRoleById(roleId);
  if (role) return role.permissionIds;
  if (isBuiltInRoleId(roleId)) return getDefaultPermissions(roleId);
  return [];
}

export function getAssignmentForUser(userId: string): RoleId {
  const state = readState();
  const found = state.assignments.find((a) => a.userId === userId);
  if (found) return found.roleId;
  if (userId === "alpha-owner") return "owner";
  return "read_only";
}

export function getEffectiveRoleForSession(session: {
  userId: string;
  role: string;
}): RoleId {
  const assigned = readState().assignments.find(
    (a) => a.userId === session.userId,
  );
  if (assigned) return assigned.roleId;
  return mapSessionRoleToEnterprise(session.role);
}

export function setUserRole(userId: string, roleId: RoleId) {
  const state = readState();
  const rest = state.assignments.filter((a) => a.userId !== userId);
  writeState({
    ...state,
    assignments: [...rest, { userId, roleId }],
  });
}

export function updateRolePermissions(
  roleId: RoleId,
  permissionIds: PermissionId[],
) {
  const state = readState();
  if (isBuiltInRoleId(roleId)) {
    writeState({
      ...state,
      builtInOverrides: {
        ...state.builtInOverrides,
        [roleId]: permissionIds,
      },
    });
    return;
  }
  writeState({
    ...state,
    customRoles: state.customRoles.map((role) =>
      role.id === roleId ? { ...role, permissionIds } : role,
    ),
  });
}

export function createCustomRole(input: {
  name: string;
  description: string;
  permissionIds: PermissionId[];
  ssoGroupHint?: string;
}): RoleDefinition {
  const state = readState();
  const id = `role-${input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
  const role: RoleDefinition = {
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    builtIn: false,
    ssoGroupHint: input.ssoGroupHint?.trim() || undefined,
    permissionIds: input.permissionIds,
  };
  writeState({
    ...state,
    customRoles: [...state.customRoles, role],
  });
  return role;
}

export function deleteCustomRole(roleId: RoleId) {
  if (isBuiltInRoleId(roleId)) return;
  const state = readState();
  writeState({
    ...state,
    customRoles: state.customRoles.filter((role) => role.id !== roleId),
    assignments: state.assignments.map((a) =>
      a.roleId === roleId ? { ...a, roleId: "read_only" } : a,
    ),
  });
}

export function appendAuditEntry(
  entry: Omit<AuditEntry, "id" | "timestamp"> & { timestamp?: string },
): AuditEntry {
  const state = readState();
  const full: AuditEntry = {
    id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    actorUserId: entry.actorUserId,
    actorName: entry.actorName,
    role: entry.role,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    details: entry.details,
    ip: entry.ip,
  };
  writeState({
    ...state,
    auditLog: [full, ...state.auditLog].slice(0, 500),
  });
  return full;
}

export function listAuditEntries(): AuditEntry[] {
  return readState().auditLog;
}
