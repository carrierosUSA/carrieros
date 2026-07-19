import {
  createAlphApprovalRequest,
  toAlphApprovalPreview,
} from "@/lib/alph/approval/engine";
import { registerAlphToolOnce } from "@/lib/alph/tools/registry";
import {
  assertCompanyMatch,
  clampLimit,
  optionalNumber,
  optionalString,
  requireString,
} from "@/lib/alph/tools/gateway";
import type {
  AlphListQuery,
  AlphToolDefinition,
  AlphToolExecutionResult,
} from "@/lib/alph/tools/types";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { listCustomersByTenant } from "@/lib/data/customers";
import {
  listCarrierDocuments,
  getCarrierDocumentById,
} from "@/lib/data/carrier-document-store";
import { listExpenses, listInvoices } from "@/lib/data/finance-store";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";
import type { AiActionKind } from "@/lib/ai-safety/confirmation";
import { can } from "@/lib/permissions/check";
import type { PermissionId } from "@/lib/permissions/types";

function parseListQuery(input: unknown): AlphListQuery {
  const obj = (input ?? {}) as Record<string, unknown>;
  return {
    query: optionalString(obj.query),
    limit: optionalNumber(obj.limit),
    offset: optionalNumber(obj.offset),
  };
}

function matchesQuery(haystack: string, query?: string): boolean {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function draftResult(
  kind: string,
  title: string,
  body: string,
): AlphToolExecutionResult<{ kind: string; title: string; body: string; draftOnly: true }> {
  return {
    ok: true,
    data: { kind, title, body, draftOnly: true },
    citations: [],
  };
}

const searchLoads: AlphToolDefinition = {
  id: "search_loads",
  name: "Search loads",
  description: "Search authorized loads for the company.",
  risk: "read",
  permission: "page.loads.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    const loads = await getLoadService().listLoads(ctx.context.tenantId, {
      search: input.query,
    });
    const page = loads.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((l) => ({
          id: l.id,
          reference: l.reference,
          status: l.status,
          origin: `${l.origin.city}, ${l.origin.state}`,
          destination: `${l.destination.city}, ${l.destination.state}`,
          driverId: l.driverId,
          truckId: l.truckId,
          rate: l.rate,
        })),
        total: loads.length,
        limit,
        offset,
      },
      citations: page.map((l) => ({
        type: "load",
        id: l.id,
        label: l.reference,
      })),
      truncated: offset + limit < loads.length,
    };
  },
};

const readLoad: AlphToolDefinition = {
  id: "read_load",
  name: "Read load",
  description: "Read one load by id (tenant-scoped).",
  risk: "read",
  permission: "page.loads.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return { loadId: requireString(obj.loadId ?? obj.id, "loadId") };
  },
  async execute(input, ctx) {
    const load = await getLoadService().getLoad(
      ctx.context.tenantId,
      input.loadId,
    );
    if (!load) {
      return { ok: false, code: "not_found", message: "Load not found." };
    }
    const mismatch = assertCompanyMatch(load.tenantId, ctx, "Load");
    if (mismatch) return mismatch;
    return {
      ok: true,
      data: {
        id: load.id,
        reference: load.reference,
        status: load.status,
        origin: `${load.origin.city}, ${load.origin.state}`,
        destination: `${load.destination.city}, ${load.destination.state}`,
        driverId: load.driverId,
        truckId: load.truckId,
        rate: load.rate,
        pickupDate: load.pickupDate,
        deliveryDate: load.deliveryDate,
      },
      citations: [{ type: "load", id: load.id, label: load.reference }],
    };
  },
};

const searchDrivers: AlphToolDefinition = {
  id: "search_drivers",
  name: "Search drivers",
  description: "Search authorized drivers.",
  risk: "read",
  permission: "page.drivers.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    const drivers = await getDriverService().listDrivers(ctx.context.tenantId, {
      search: input.query,
    });
    const page = drivers.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          phone: d.phone,
        })),
        total: drivers.length,
        limit,
        offset,
      },
      citations: page.map((d) => ({ type: "driver", id: d.id, label: d.name })),
      truncated: offset + limit < drivers.length,
    };
  },
};

const readDriver: AlphToolDefinition = {
  id: "read_driver",
  name: "Read driver",
  description: "Read one driver by id.",
  risk: "read",
  permission: "page.drivers.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return { driverId: requireString(obj.driverId ?? obj.id, "driverId") };
  },
  async execute(input, ctx) {
    const driver = await getDriverService().getDriver(
      ctx.context.tenantId,
      input.driverId,
    );
    if (!driver) {
      return { ok: false, code: "not_found", message: "Driver not found." };
    }
    const mismatch = assertCompanyMatch(driver.tenantId, ctx, "Driver");
    if (mismatch) return mismatch;
    return {
      ok: true,
      data: {
        id: driver.id,
        name: driver.name,
        status: driver.status,
        phone: driver.phone,
        email: driver.email,
      },
      citations: [{ type: "driver", id: driver.id, label: driver.name }],
    };
  },
};

const searchTrucks: AlphToolDefinition = {
  id: "search_trucks",
  name: "Search trucks",
  description: "Search authorized trucks.",
  risk: "read",
  permission: "page.fleet.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    let trucks = await getFleetService().listTrucks(ctx.context.tenantId);
    if (input.query) {
      trucks = trucks.filter((t) =>
        matchesQuery(`${t.unitNumber} ${t.vin ?? ""} ${t.make ?? ""}`, input.query),
      );
    }
    const page = trucks.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((t) => ({
          id: t.id,
          unitNumber: t.unitNumber,
          status: t.status,
          make: t.make,
          model: t.model,
        })),
        total: trucks.length,
        limit,
        offset,
      },
      citations: page.map((t) => ({
        type: "truck",
        id: t.id,
        label: t.unitNumber,
      })),
      truncated: offset + limit < trucks.length,
    };
  },
};

const readTruck: AlphToolDefinition = {
  id: "read_truck",
  name: "Read truck",
  description: "Read one truck by id.",
  risk: "read",
  permission: "page.fleet.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return { truckId: requireString(obj.truckId ?? obj.id, "truckId") };
  },
  async execute(input, ctx) {
    const truck = await getFleetService().getTruck(
      ctx.context.tenantId,
      input.truckId,
    );
    if (!truck) {
      return { ok: false, code: "not_found", message: "Truck not found." };
    }
    const mismatch = assertCompanyMatch(truck.tenantId, ctx, "Truck");
    if (mismatch) return mismatch;
    return {
      ok: true,
      data: {
        id: truck.id,
        unitNumber: truck.unitNumber,
        status: truck.status,
        vin: truck.vin,
        make: truck.make,
        model: truck.model,
        year: truck.year,
      },
      citations: [{ type: "truck", id: truck.id, label: truck.unitNumber }],
    };
  },
};

const searchTrailers: AlphToolDefinition = {
  id: "search_trailers",
  name: "Search trailers",
  description: "Search authorized trailers.",
  risk: "read",
  permission: "page.fleet.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    let trailers = await getFleetService().listTrailers(ctx.context.tenantId);
    if (input.query) {
      trailers = trailers.filter((t) =>
        matchesQuery(`${t.unitNumber} ${t.vin ?? ""}`, input.query),
      );
    }
    const page = trailers.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((t) => ({
          id: t.id,
          unitNumber: t.unitNumber,
          status: t.status,
          type: t.type,
        })),
        total: trailers.length,
        limit,
        offset,
      },
      citations: page.map((t) => ({
        type: "trailer",
        id: t.id,
        label: t.unitNumber,
      })),
      truncated: offset + limit < trailers.length,
    };
  },
};

const readTrailer: AlphToolDefinition = {
  id: "read_trailer",
  name: "Read trailer",
  description: "Read one trailer by id.",
  risk: "read",
  permission: "page.fleet.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return { trailerId: requireString(obj.trailerId ?? obj.id, "trailerId") };
  },
  async execute(input, ctx) {
    const trailer = await getFleetService().getTrailer(
      ctx.context.tenantId,
      input.trailerId,
    );
    if (!trailer) {
      return { ok: false, code: "not_found", message: "Trailer not found." };
    }
    const mismatch = assertCompanyMatch(trailer.tenantId, ctx, "Trailer");
    if (mismatch) return mismatch;
    return {
      ok: true,
      data: {
        id: trailer.id,
        unitNumber: trailer.unitNumber,
        status: trailer.status,
        type: trailer.type,
        vin: trailer.vin,
      },
      citations: [
        { type: "trailer", id: trailer.id, label: trailer.unitNumber },
      ],
    };
  },
};

const searchCustomers: AlphToolDefinition = {
  id: "search_customers",
  name: "Search customers",
  description: "Search customers and brokers (authorized).",
  risk: "read",
  permission: "page.brokers.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    const customers = listCustomersByTenant(ctx.context.tenantId).filter((c) =>
      matchesQuery(`${c.name} ${c.id}`, input.query),
    );
    const brokers = listBrokersByTenant(ctx.context.tenantId).filter((b) =>
      matchesQuery(`${b.name} ${b.id}`, input.query),
    );
    const combined = [
      ...customers.map((c) => ({
        id: c.id,
        name: c.name,
        kind: "customer" as const,
      })),
      ...brokers.map((b) => ({
        id: b.id,
        name: b.name,
        kind: "broker" as const,
      })),
    ];
    const page = combined.slice(offset, offset + limit);
    return {
      ok: true,
      data: { items: page, total: combined.length, limit, offset },
      citations: page.map((r) => ({
        type: r.kind,
        id: r.id,
        label: r.name,
      })),
      truncated: offset + limit < combined.length,
    };
  },
};

const searchDocuments: AlphToolDefinition = {
  id: "search_documents",
  name: "Search documents",
  description: "Search document metadata for the company.",
  risk: "read",
  permission: "page.documents.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    const docs = listCarrierDocuments(ctx.context.tenantId).filter((d) =>
      matchesQuery(
        `${d.id} ${d.filename} ${d.category} ${d.links?.loadId ?? ""}`,
        input.query,
      ),
    );
    const page = docs.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((d) => ({
          id: d.id,
          filename: d.filename,
          category: d.category,
          status: d.status,
          loadId: d.links?.loadId,
          hasOcrText: Boolean(d.ocrText),
        })),
        total: docs.length,
        limit,
        offset,
      },
      citations: page.map((d) => ({
        type: "document",
        id: d.id,
        label: d.filename,
      })),
      truncated: offset + limit < docs.length,
    };
  },
};

const readDocumentMetadata: AlphToolDefinition = {
  id: "read_document_metadata",
  name: "Read document metadata",
  description: "Read document metadata (not raw file bytes).",
  risk: "read",
  permission: "page.documents.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return {
      documentId: requireString(obj.documentId ?? obj.id, "documentId"),
    };
  },
  async execute(input, ctx) {
    const doc = getCarrierDocumentById(ctx.context.tenantId, input.documentId);
    if (!doc) {
      return { ok: false, code: "not_found", message: "Document not found." };
    }
    return {
      ok: true,
      data: {
        id: doc.id,
        filename: doc.filename,
        category: doc.category,
        status: doc.status,
        loadId: doc.links?.loadId,
        uploadedAt: doc.uploadedAt,
        mimeType: doc.mimeType,
        hasOcrText: Boolean(doc.ocrText),
      },
      citations: [{ type: "document", id: doc.id, label: doc.filename }],
    };
  },
};

const searchInvoices: AlphToolDefinition = {
  id: "search_invoices",
  name: "Search invoices",
  description: "Search invoices for the company.",
  risk: "read",
  permission: "page.finance.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    const invoices = listInvoices(ctx.context.tenantId).filter((i) =>
      matchesQuery(
        `${i.id} ${i.invoiceNumber} ${i.brokerName} ${i.status}`,
        input.query,
      ),
    );
    const page = invoices.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((i) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          status: i.status,
          amount: i.amount,
          brokerName: i.brokerName,
          dueDate: i.dueDate,
        })),
        total: invoices.length,
        limit,
        offset,
      },
      citations: page.map((i) => ({
        type: "invoice",
        id: i.id,
        label: i.invoiceNumber,
      })),
      truncated: offset + limit < invoices.length,
    };
  },
};

const searchExpenses: AlphToolDefinition = {
  id: "search_expenses",
  name: "Search expenses",
  description: "Search expense records.",
  risk: "read",
  permission: "page.finance.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    const expenses = listExpenses(ctx.context.tenantId).filter((e) =>
      matchesQuery(
        `${e.id} ${e.category} ${e.vendor ?? ""} ${e.description}`,
        input.query,
      ),
    );
    const page = expenses.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((e) => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          vendor: e.vendor,
          occurredAt: e.occurredAt,
          description: e.description,
        })),
        total: expenses.length,
        limit,
        offset,
      },
      citations: page.map((e) => ({ type: "expense", id: e.id })),
      truncated: offset + limit < expenses.length,
    };
  },
};

const searchMaintenance: AlphToolDefinition = {
  id: "search_maintenance",
  name: "Search maintenance",
  description: "Search maintenance records.",
  risk: "read",
  permission: "page.fleet.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    let rows = await getFleetService().listMaintenance(ctx.context.tenantId);
    if (input.query) {
      rows = rows.filter((r) =>
        matchesQuery(
          `${r.id} ${r.truckId} ${r.type} ${r.status} ${r.description}`,
          input.query,
        ),
      );
    }
    const page = rows.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((r) => ({
          id: r.id,
          truckId: r.truckId,
          type: r.type,
          status: r.status,
          scheduledDate: r.scheduledDate,
          cost: r.cost,
        })),
        total: rows.length,
        limit,
        offset,
      },
      citations: page.map((r) => ({ type: "maintenance", id: r.id })),
      truncated: offset + limit < rows.length,
    };
  },
};

const searchFuel: AlphToolDefinition = {
  id: "search_fuel",
  name: "Search fuel",
  description: "Search fuel records.",
  risk: "read",
  permission: "page.fleet.view",
  defaultLimit: 10,
  validate: parseListQuery,
  async execute(input, ctx) {
    const limit = clampLimit(input.limit, 10);
    const offset = Math.max(0, Math.floor(input.offset ?? 0));
    let rows = await getFleetService().listFuelRecords(ctx.context.tenantId);
    if (input.query) {
      rows = rows.filter((r) =>
        matchesQuery(
          `${r.id} ${r.truckId} ${r.location} ${r.date}`,
          input.query,
        ),
      );
    }
    const page = rows.slice(offset, offset + limit);
    return {
      ok: true,
      data: {
        items: page.map((r) => ({
          id: r.id,
          truckId: r.truckId,
          gallons: r.gallons,
          cost: r.cost,
          location: r.location,
          date: r.date,
        })),
        total: rows.length,
        limit,
        offset,
      },
      citations: page.map((r) => ({ type: "fuel", id: r.id })),
      truncated: offset + limit < rows.length,
    };
  },
};

const generateReportDraft: AlphToolDefinition = {
  id: "generate_report_draft",
  name: "Generate report draft",
  description: "Prepare a report draft — does not publish.",
  risk: "draft",
  permission: "page.analytics.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return {
      topic: optionalString(obj.topic) ?? "operations summary",
    };
  },
  async execute(input, ctx) {
    return draftResult(
      "report",
      `Draft report: ${input.topic}`,
      `Alph prepared a draft ${input.topic} for ${ctx.context.companyName} (${ctx.context.workspace} workspace). This is a draft only — not published. Have a human review before sharing.`,
    );
  },
};

const generateMessageDraft: AlphToolDefinition = {
  id: "generate_message_draft",
  name: "Generate message draft",
  description: "Prepare a message draft — does not send.",
  risk: "draft",
  permission: "page.loads.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return {
      audience: optionalString(obj.audience) ?? "driver",
      subject: optionalString(obj.subject) ?? "Update",
      notes: optionalString(obj.notes) ?? "",
    };
  },
  async execute(input) {
    return draftResult(
      "message",
      `Draft message to ${input.audience}`,
      `Subject: ${input.subject}\n\n${input.notes || "(Alph left the body blank for you to complete.)"}\n\n— Draft only. Alph will not send this without your confirmation.`,
    );
  },
};

const generateInvoiceDraft: AlphToolDefinition = {
  id: "generate_invoice_draft",
  name: "Generate invoice draft",
  description: "Prepare an invoice draft — does not send or finalize.",
  risk: "draft",
  permission: "button.finance.create",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return {
      loadId: optionalString(obj.loadId),
      notes: optionalString(obj.notes) ?? "",
    };
  },
  async execute(input, ctx) {
    return draftResult(
      "invoice",
      "Invoice draft",
      `Invoice draft for company ${ctx.context.companyName}${input.loadId ? ` · load ${input.loadId}` : ""}. ${input.notes}\n\nDraft only — Alph will not send or finalize without approval.`,
    );
  },
};

const generatePayrollDraft: AlphToolDefinition = {
  id: "generate_payroll_draft",
  name: "Generate payroll draft",
  description: "Prepare a payroll draft — does not create or pay.",
  risk: "draft",
  permission: "button.payroll.create",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    return {
      period: optionalString(obj.period) ?? "current period",
    };
  },
  async execute(input, ctx) {
    return draftResult(
      "payroll",
      "Payroll draft",
      `Payroll draft for ${input.period} · ${ctx.context.companyName}. Figures require human verification. Alph will not create or approve payroll without confirmation.`,
    );
  },
};

const createApprovalRequestTool: AlphToolDefinition = {
  id: "create_approval_request",
  name: "Create approval request",
  description:
    "Prepare a critical action for human approval. Never executes the action.",
  risk: "approval",
  permission: "page.loads.view",
  validate: (input) => {
    const obj = (input ?? {}) as Record<string, unknown>;
    const actionKind = requireString(obj.actionKind, "actionKind") as AiActionKind;
    const permissionRequired = requireString(
      obj.permissionRequired,
      "permissionRequired",
    ) as PermissionId;
    const recordsRaw = Array.isArray(obj.recordsAffected)
      ? obj.recordsAffected
      : [];
    return {
      actionKind,
      proposedAction: requireString(obj.proposedAction, "proposedAction"),
      permissionRequired,
      financialImpact: optionalString(obj.financialImpact),
      operationalImpact: optionalString(obj.operationalImpact),
      conversationId: optionalString(obj.conversationId),
      recordsAffected: recordsRaw.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          type: requireString(row.type, "recordsAffected.type"),
          id: requireString(row.id, "recordsAffected.id"),
          label: optionalString(row.label),
        };
      }),
      preview:
        obj.preview && typeof obj.preview === "object"
          ? (obj.preview as Record<string, unknown>)
          : {},
    };
  },
  async execute(input, ctx) {
    if (ctx.mode !== "act") {
      return {
        ok: false,
        code: "forbidden_write",
        message: "Approval requests require ACT mode.",
      };
    }

    // Re-check the permission named in the proposal (may be stricter than tool permission).
    if (
      !can(
        { userId: ctx.context.userId, role: ctx.context.role },
        input.permissionRequired,
      )
    ) {
      return {
        ok: false,
        code: "permission_denied",
        message: `You don't have permission: ${input.permissionRequired}`,
      };
    }

    const row = createAlphApprovalRequest({
      companyId: ctx.context.companyId,
      tenantId: ctx.context.tenantId,
      userId: ctx.context.userId,
      conversationId: input.conversationId,
      requestId: ctx.requestId,
      actionKind: input.actionKind,
      proposedAction: input.proposedAction,
      recordsAffected: input.recordsAffected,
      financialImpact: input.financialImpact,
      operationalImpact: input.operationalImpact,
      permissionRequired: input.permissionRequired,
      preview: input.preview,
    });

    return {
      ok: true,
      data: {
        approval: toAlphApprovalPreview(row),
        executed: false,
        note: "Awaiting human confirmation. Alph has not executed this action.",
      },
      citations: input.recordsAffected,
    };
  },
};

const ALL_TOOLS: AlphToolDefinition[] = [
  searchLoads,
  readLoad,
  searchDrivers,
  readDriver,
  searchTrucks,
  readTruck,
  searchTrailers,
  readTrailer,
  searchCustomers,
  searchDocuments,
  readDocumentMetadata,
  searchInvoices,
  searchExpenses,
  searchMaintenance,
  searchFuel,
  generateReportDraft,
  generateMessageDraft,
  generateInvoiceDraft,
  generatePayrollDraft,
  createApprovalRequestTool,
];

/** Register all foundation tools (idempotent). */
export function ensureAlphToolsRegistered(): void {
  for (const tool of ALL_TOOLS) {
    registerAlphToolOnce(tool);
  }
}

export function listRegisteredAlphToolIds(): string[] {
  ensureAlphToolsRegistered();
  return ALL_TOOLS.map((t) => t.id);
}
