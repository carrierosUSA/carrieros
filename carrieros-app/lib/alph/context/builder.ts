import {
  getWorkspaceKnowledge,
  resolveWorkspaceFocus,
} from "@/lib/alph/context/workspaces";
import type {
  AlphBuiltContext,
  AlphContextChip,
  AlphContextInput,
  AlphRecordRef,
} from "@/lib/alph/context/types";
import { getCurrentSession } from "@/lib/auth/session";
import { getActiveCompany } from "@/lib/data/tenant";
import { listPermissionsForSubject } from "@/lib/permissions/check";

function newRequestId(): string {
  return `alph_req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function pageLabelFromPath(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  return parts
    .slice(0, 2)
    .map((p) => p.replace(/\[|\]/g, ""))
    .join(" / ");
}

/**
 * Permission-aware context builder.
 * Never elevates beyond the authenticated session.
 */
export function buildAlphContext(
  input: AlphContextInput = {},
): AlphBuiltContext {
  const session = getCurrentSession();
  const company = getActiveCompany();
  const permissions = listPermissionsForSubject(session);
  const workspace = resolveWorkspaceFocus(input.workspaceId, input.pathname);
  const knowledge = getWorkspaceKnowledge(workspace);
  const removed = new Set(input.removedChipIds ?? []);

  const recordRefs: AlphRecordRef[] = [];
  const chips: AlphContextChip[] = [];

  const pushChip = (chip: AlphContextChip) => {
    if (removed.has(chip.id)) return;
    chips.push(chip);
  };

  pushChip({
    id: "company",
    kind: "company",
    label: "Company",
    value: company.name,
    removable: false,
  });

  pushChip({
    id: "workspace",
    kind: "workspace",
    label: "Workspace",
    value: knowledge.focus === "unknown" ? "General" : knowledge.focus,
    removable: true,
  });

  if (input.pathname) {
    pushChip({
      id: "page",
      kind: "page",
      label: "Page",
      value: pageLabelFromPath(input.pathname) ?? input.pathname,
      removable: true,
    });
  }

  if (input.loadId) {
    recordRefs.push({ type: "load", id: input.loadId });
    pushChip({
      id: `load:${input.loadId}`,
      kind: "load",
      label: "Load",
      value: input.loadId,
      removable: true,
    });
  }
  if (input.driverId) {
    recordRefs.push({ type: "driver", id: input.driverId });
    pushChip({
      id: `driver:${input.driverId}`,
      kind: "driver",
      label: "Driver",
      value: input.driverId,
      removable: true,
    });
  }
  if (input.truckId) {
    recordRefs.push({ type: "truck", id: input.truckId });
    pushChip({
      id: `truck:${input.truckId}`,
      kind: "truck",
      label: "Truck",
      value: input.truckId,
      removable: true,
    });
  }
  if (input.trailerId) {
    recordRefs.push({ type: "trailer", id: input.trailerId });
    pushChip({
      id: `trailer:${input.trailerId}`,
      kind: "trailer",
      label: "Trailer",
      value: input.trailerId,
      removable: true,
    });
  }
  if (input.documentId) {
    recordRefs.push({ type: "document", id: input.documentId });
  }
  if (input.invoiceId) {
    recordRefs.push({ type: "invoice", id: input.invoiceId });
  }

  if (input.dateFrom || input.dateTo) {
    pushChip({
      id: "date_range",
      kind: "date_range",
      label: "Date range",
      value: [input.dateFrom ?? "…", input.dateTo ?? "…"].join(" → "),
      removable: true,
    });
  }

  return {
    requestId: newRequestId(),
    builtAt: new Date().toISOString(),
    tenantId: session.tenantId,
    companyId: session.companyId,
    companyName: company.name,
    userId: session.userId,
    userName: session.name,
    role: session.role,
    permissions,
    workspace,
    workspaceKnowledge: knowledge,
    pathname: input.pathname,
    pageLabel: pageLabelFromPath(input.pathname),
    recordRefs,
    chips,
    recentActivity: (input.recentActivity ?? []).slice(0, 12),
    intentHint: input.intentHint,
    dateRange:
      input.dateFrom || input.dateTo
        ? { from: input.dateFrom, to: input.dateTo }
        : undefined,
  };
}
