import type { CarrierOSRole } from "@/lib/auth/session";
import type {
  CarrierDocument,
  CarrierDocumentStatus,
  DocumentCategory,
} from "@/lib/types/documents";
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS } from "@/lib/types/documents";

export type DocumentDashboardStats = {
  totalDocuments: number;
  uploadedToday: number;
  missingDocuments: number;
  pendingReview: number;
  expiringDocuments: number;
};

export type DocumentSearchFilters = {
  query?: string;
  category?: DocumentCategory | "all";
  status?: CarrierDocumentStatus | "all" | "active";
};

const SEARCH_PLACEHOLDER =
  "Search by load, driver, truck, trailer, broker, invoice, PO, BOL, filename, OCR, tags…";

export function getDocumentSearchPlaceholder(): string {
  return SEARCH_PLACEHOLDER;
}

function startOfTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildDocumentDashboardStats(
  documents: CarrierDocument[],
): DocumentDashboardStats {
  const today = startOfTodayIsoDate();
  let uploadedToday = 0;
  let missingDocuments = 0;
  let pendingReview = 0;
  let expiringDocuments = 0;
  let totalDocuments = 0;

  for (const doc of documents) {
    if (doc.status === "deleted") {
      continue;
    }

    totalDocuments += 1;

    if (doc.uploadedAt.slice(0, 10) === today) {
      uploadedToday += 1;
    }

    if (doc.status === "missing") {
      missingDocuments += 1;
    }

    if (doc.status === "pending_review") {
      pendingReview += 1;
    }

    if (doc.status === "expiring") {
      expiringDocuments += 1;
    }
  }

  return {
    totalDocuments,
    uploadedToday,
    missingDocuments,
    pendingReview,
    expiringDocuments,
  };
}

function documentSearchHaystack(doc: CarrierDocument): string {
  const linkValues = Object.values(doc.links).filter(Boolean).join(" ");
  const fieldValues = doc.extractedFields.map((field) => field.value).join(" ");
  const tags = doc.tags.join(" ");

  return [
    doc.filename,
    doc.category,
    DOCUMENT_CATEGORY_LABELS[doc.category],
    doc.status,
    doc.ocrText ?? "",
    doc.loadNumber ?? "",
    doc.invoiceNumber ?? "",
    doc.poNumber ?? "",
    doc.bolNumber ?? "",
    doc.uploadedBy,
    doc.notes ?? "",
    linkValues,
    fieldValues,
    tags,
    doc.uploadedAt.slice(0, 10),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterDocuments(
  documents: CarrierDocument[],
  filters: DocumentSearchFilters,
): CarrierDocument[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const category = filters.category ?? "all";
  const status = filters.status ?? "active";

  return documents.filter((doc) => {
    if (status === "active" && doc.status === "deleted") {
      return false;
    }

    if (status !== "all" && status !== "active" && doc.status !== status) {
      return false;
    }

    if (category !== "all" && doc.category !== category) {
      return false;
    }

    if (!query) {
      return true;
    }

    return documentSearchHaystack(doc).includes(query);
  });
}

export function countDocumentsByCategory(
  documents: CarrierDocument[],
): Record<DocumentCategory | "all", number> {
  const counts = Object.fromEntries(
    DOCUMENT_CATEGORIES.map((category) => [category, 0]),
  ) as Record<DocumentCategory, number>;

  let all = 0;

  for (const doc of documents) {
    if (doc.status === "deleted") {
      continue;
    }

    all += 1;
    counts[doc.category] += 1;
  }

  return { all, ...counts };
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDocumentDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getLinkSummary(doc: CarrierDocument): string {
  const parts: string[] = [];

  if (doc.loadNumber) {
    parts.push(doc.loadNumber);
  } else if (doc.links.loadId) {
    parts.push(doc.links.loadId.replace("load-", "LD-"));
  }

  if (doc.links.driverId) {
    parts.push(
      doc.links.driverId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    );
  }

  if (doc.links.truckId) {
    parts.push(doc.links.truckId.replace("truck-", "Unit "));
  }

  if (doc.links.trailerId) {
    parts.push(doc.links.trailerId.replace("trailer-", "Trailer "));
  }

  return parts.length > 0 ? parts.join(" · ") : "Not linked";
}

export function canRoleAccessDocuments(role: CarrierOSRole): boolean {
  return [
    "super_admin",
    "owner",
    "dispatcher",
    "safety",
    "accounting",
    "accountant",
    "maintenance",
    "fleet_manager",
    "read_only",
  ].includes(role);
}
