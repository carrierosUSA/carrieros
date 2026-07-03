import {
  invoiceDraftStore,
  loadDocumentStore,
  packetStore,
} from "@/lib/data/document-store";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getLoadService } from "@/lib/services/loads";
import type {
  InvoiceDraft,
  InvoicePacket,
  LoadDocumentRecord,
  LoadDocumentStatus,
  LoadDocumentType,
} from "@/lib/types";
import {
  LOAD_DOCUMENT_LABELS,
  LOAD_DOCUMENT_SEQUENCE,
} from "@/lib/types";
import type {
  CaptureLoadDocumentInput,
  PreparePacketInput,
} from "@/lib/services/documents/document-inputs";
import type {
  DocumentPacketChecklistItem,
  DocumentPacketSummary,
  DocumentService,
} from "@/lib/services/documents/document-service";

function sequenceFor(type: LoadDocumentType): number {
  return LOAD_DOCUMENT_SEQUENCE.findIndex((item) => item.type === type) + 1;
}

function requirementFor(type: LoadDocumentType): boolean {
  return LOAD_DOCUMENT_SEQUENCE.find((item) => item.type === type)?.required ?? false;
}

function statusRank(status: LoadDocumentStatus): number {
  const ranks: Record<LoadDocumentStatus, number> = {
    missing: 0,
    captured: 1,
    scanned: 2,
    approved: 3,
  };
  return ranks[status];
}

function bestDocumentForType(
  documents: LoadDocumentRecord[],
  type: LoadDocumentType,
): LoadDocumentRecord | undefined {
  return documents
    .filter((document) => document.type === type)
    .sort((a, b) => statusRank(b.status) - statusRank(a.status))[0];
}

function buildChecklist(
  documents: LoadDocumentRecord[],
  invoiceDraft?: InvoiceDraft,
): DocumentPacketChecklistItem[] {
  return LOAD_DOCUMENT_SEQUENCE.map((item, index) => {
    const document = bestDocumentForType(documents, item.type);

    if (item.type === "invoice" && invoiceDraft) {
      return {
        ...item,
        sequence: index + 1,
        status: invoiceDraft.status === "ready" ? "approved" : "captured",
      };
    }

    return {
      ...item,
      sequence: index + 1,
      status: document?.status ?? "missing",
      document,
    };
  });
}

function buildSummary(
  tenantId: string,
  loadId: string,
): DocumentPacketSummary {
  const documents = loadDocumentStore
    .filter((document) => document.tenantId === tenantId && document.loadId === loadId)
    .sort((a, b) => a.sequence - b.sequence);
  const invoiceDraft = invoiceDraftStore.find(
    (invoice) => invoice.tenantId === tenantId && invoice.loadId === loadId,
  );
  const packet = packetStore.find(
    (entry) => entry.tenantId === tenantId && entry.loadId === loadId,
  );
  const checklist = buildChecklist(documents, invoiceDraft);
  const missingRequired = checklist.filter(
    (item) => item.required && item.status === "missing",
  );

  return {
    loadId,
    checklist,
    documents,
    invoiceDraft,
    packet,
    missingRequired,
    readyToSend: missingRequired.length === 0 && Boolean(invoiceDraft),
    nextMissing: missingRequired[0],
  };
}

export const mockDocumentService: DocumentService = {
  async getPacketSummary(tenantId, loadId) {
    return buildSummary(tenantId, loadId);
  },

  async listLoadDocuments(tenantId, loadId) {
    return loadDocumentStore.filter(
      (document) => document.tenantId === tenantId && document.loadId === loadId,
    );
  },

  async captureLoadDocument(tenantId, input: CaptureLoadDocumentInput) {
    const now = new Date().toISOString();
    const label = LOAD_DOCUMENT_LABELS[input.type];
    const document: LoadDocumentRecord = {
      tenantId,
      id: `doc-${input.loadId}-${input.type}-${Date.now()}`,
      loadId: input.loadId,
      type: input.type,
      label,
      status: "scanned",
      fileName: input.fileName || `${input.loadId}-${input.type}.jpg`,
      capturedAt: now,
      scannedAt: now,
      previewUrl: `/documents/mock/${input.loadId}-${input.type}.pdf`,
      sequence: sequenceFor(input.type),
      required: requirementFor(input.type),
    };

    loadDocumentStore.unshift(document);
    return document;
  },

  async generateInvoiceDraft(tenantId, loadId) {
    const load = await getLoadService().getLoad(tenantId, loadId);

    if (!load) {
      throw new Error("Load not found.");
    }

    const existing = invoiceDraftStore.find(
      (invoice) => invoice.tenantId === tenantId && invoice.loadId === loadId,
    );

    if (existing) {
      existing.status = "ready";
      await getLoadService().updateLoad(tenantId, loadId, {
        invoiceId: existing.id,
        status: load.status === "delivered" ? "invoiced" : load.status,
      });
      return existing;
    }

    const broker = load.brokerId ? getBrokerById(load.brokerId) : undefined;
    const customer = getCustomerById(load.customerId);
    const invoiceDraft: InvoiceDraft = {
      tenantId,
      id: `invoice-draft-${loadId}-${Date.now()}`,
      loadId,
      invoiceNumber: `INV-${load.reference}`,
      amount: load.rate,
      status: "ready",
      billTo: broker?.name ?? customer?.name ?? "Direct customer",
      generatedAt: new Date().toISOString(),
    };

    invoiceDraftStore.unshift(invoiceDraft);
    await getLoadService().updateLoad(tenantId, loadId, {
      invoiceId: invoiceDraft.id,
      status: load.status === "delivered" ? "invoiced" : load.status,
    });
    return invoiceDraft;
  },

  async preparePacket(tenantId, input: PreparePacketInput) {
    const summary = buildSummary(tenantId, input.loadId);

    if (!summary.readyToSend) {
      throw new Error("Packet is missing required documents.");
    }

    const existing = packetStore.find(
      (packet) => packet.tenantId === tenantId && packet.loadId === input.loadId,
    );
    const now = new Date().toISOString();
    const documentIds = [
      ...summary.documents.map((document) => document.id),
      ...(summary.invoiceDraft ? [summary.invoiceDraft.id] : []),
    ];

    if (existing) {
      existing.documentIds = documentIds;
      existing.invoiceDraftId = summary.invoiceDraft?.id;
      existing.status = "ready_to_send";
      existing.generatedPdfName = `${input.loadId}-invoice-packet.pdf`;
      existing.readyMessage = `Ready to send/upload to ${input.destination}.`;
      existing.updatedAt = now;
      return existing;
    }

    const packet: InvoicePacket = {
      tenantId,
      id: `packet-${input.loadId}-${Date.now()}`,
      loadId: input.loadId,
      documentIds,
      invoiceDraftId: summary.invoiceDraft?.id,
      status: "ready_to_send",
      generatedPdfName: `${input.loadId}-invoice-packet.pdf`,
      readyMessage: `Ready to send/upload to ${input.destination}.`,
      updatedAt: now,
    };

    packetStore.unshift(packet);
    return packet;
  },
};
