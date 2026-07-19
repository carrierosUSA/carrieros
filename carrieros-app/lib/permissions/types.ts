export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "export"
  | "approve"
  | "share"
  | "download"
  | "upload"
  | "assign"
  | "manage";

export type PermissionResourceType = "page" | "button" | "document";

/** Stable permission id, e.g. page.loads.view, button.loads.create, document.rate_con.download */
export type PermissionId = string;

export type PermissionDef = {
  id: PermissionId;
  type: PermissionResourceType;
  resource: string;
  action: PermissionAction;
  label: string;
  description?: string;
};

export type BuiltInRoleId =
  | "super_admin"
  | "owner"
  | "dispatcher"
  | "accounting"
  | "safety"
  | "maintenance"
  | "driver"
  | "broker"
  | "shipper"
  | "customer"
  | "read_only";

export type RoleId = BuiltInRoleId | (string & {});

export type RoleDefinition = {
  id: RoleId;
  name: string;
  description: string;
  builtIn: boolean;
  /** Future SSO / IdP group mapping hint */
  ssoGroupHint?: string;
  permissionIds: PermissionId[];
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  title: string;
};

export type UserRoleAssignment = {
  userId: string;
  roleId: RoleId;
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorName: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ip?: string;
};

export type PermissionsStoreState = {
  customRoles: RoleDefinition[];
  /** Overrides for built-in role permission sets (demo editing) */
  builtInOverrides: Partial<Record<BuiltInRoleId, PermissionId[]>>;
  assignments: UserRoleAssignment[];
  auditLog: AuditEntry[];
};
