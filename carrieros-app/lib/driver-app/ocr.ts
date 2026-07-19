import type {
  DriverDocKind,
  OcrExtractedFields,
  PodAiResult,
} from "@/lib/driver-app/types";
import { DOC_KIND_OPTIONS } from "@/lib/driver-app/constants";

/** Heuristic / demo OCR — uses filename + optional type hint + photo metadata. */
export function identifyDocumentType(
  fileName: string,
  hint?: DriverDocKind,
): DriverDocKind {
  if (hint) return hint;
  const n = fileName.toLowerCase();
  if (n.includes("pod") || n.includes("delivery")) return "pod";
  if (n.includes("bol") || n.includes("bill")) return "bol";
  if (n.includes("rate") || n.includes("rc")) return "rate_con";
  if (n.includes("fuel") || n.includes("diesel") || n.includes("gas")) return "fuel";
  if (n.includes("scale") || n.includes("weight")) return "scale";
  if (n.includes("lumper")) return "lumper";
  if (n.includes("repair") || n.includes("shop")) return "repair";
  if (n.includes("park")) return "parking";
  if (n.includes("hotel") || n.includes("motel")) return "hotel";
  if (n.includes("toll")) return "toll";
  if (n.includes("inspect") || n.includes("dvir")) return "inspection";
  if (n.includes("insur")) return "insurance";
  if (n.includes("regist")) return "registration";
  if (n.includes("permit")) return "permits";
  if (n.includes("medical") || n.includes("dot")) return "medical";
  if (n.includes("cdl") || n.includes("license")) return "cdl";
  return "other";
}

export function extractDocumentFields(input: {
  fileName: string;
  kind?: DriverDocKind;
  loadId?: string;
  truckUnit?: string;
  trailerUnit?: string;
  fileSize?: number;
  lastModified?: number;
}): OcrExtractedFields {
  const kind = identifyDocumentType(input.fileName, input.kind);
  const label = DOC_KIND_OPTIONS.find((d) => d.id === kind)?.label ?? "Document";
  const stamp = input.lastModified
    ? new Date(input.lastModified).toLocaleString()
    : new Date().toLocaleString();
  const sizeKb = input.fileSize ? Math.max(1, Math.round(input.fileSize / 1024)) : 240;

  const baseFields: Record<string, string> = {
    fileName: input.fileName,
    capturedAt: stamp,
    fileSizeKb: String(sizeKb),
  };

  switch (kind) {
    case "pod":
      return {
        documentType: kind,
        confidence: 0.91,
        summary: `AI identified ${label}. Signature and delivery time likely present — review POD AI summary.`,
        fields: {
          ...baseFields,
          receiver: "Warehouse Dock 3",
          pieces: "24",
          seal: "SL-88421",
        },
        linkedLoadId: input.loadId,
        linkedTruck: input.truckUnit,
        linkedTrailer: input.trailerUnit,
      };
    case "fuel":
      return {
        documentType: kind,
        confidence: 0.88,
        summary: `AI extracted fuel receipt fields from ${input.fileName}.`,
        fields: {
          ...baseFields,
          gallons: "86.4",
          amount: "312.40",
          station: "Love's Travel Stop",
          product: "Diesel",
        },
        linkedTruck: input.truckUnit,
        linkedLoadId: input.loadId,
      };
    case "bol":
      return {
        documentType: kind,
        confidence: 0.86,
        summary: `Bill of lading detected. Shipper and piece count extracted for dispatch.`,
        fields: {
          ...baseFields,
          shipper: "Capital Freight DC",
          pieces: "24",
          weightLbs: "42000",
        },
        linkedLoadId: input.loadId,
        linkedTruck: input.truckUnit,
      };
    case "rate_con":
      return {
        documentType: kind,
        confidence: 0.84,
        summary: `Rate confirmation detected. Rate and lane fields ready for load file.`,
        fields: {
          ...baseFields,
          rate: "2450",
          lane: "Austin TX → Oklahoma City OK",
        },
        linkedLoadId: input.loadId,
      };
    default:
      return {
        documentType: kind,
        confidence: 0.72,
        summary: `AI categorized as ${label}. Fields are demo-extracted from photo metadata.`,
        fields: baseFields,
        linkedLoadId: input.loadId,
        linkedTruck: input.truckUnit,
        linkedTrailer: input.trailerUnit,
      };
  }
}

export function processPodAi(input: {
  fileName: string;
  loadReference?: string;
}): PodAiResult {
  const deliveredAt = new Date().toISOString();
  return {
    signaturePresent: true,
    deliveredAt,
    receiverName: "Maria Santos",
    sealNumber: "SL-88421",
    pieces: 24,
    notes: "Clean delivery · no OS&D noted",
    summary: `POD AI: ${input.loadReference ?? "Load"} delivered. Signature from Maria Santos, seal SL-88421, 24 pieces. Dispatch & accounting notified. Ready for invoice.`,
    invoiceReady: true,
    dispatchNotified: true,
    accountingNotified: true,
  };
}

export function categorizeExpenseAi(fileName: string, note: string): {
  category: string;
  flag: "personal" | "company" | "reimbursable";
  summary: string;
} {
  const text = `${fileName} ${note}`.toLowerCase();
  if (text.includes("hotel") || text.includes("motel")) {
    return {
      category: "Hotel",
      flag: "reimbursable",
      summary: "AI: overnight lodging — flagged reimbursable for settlement.",
    };
  }
  if (text.includes("fuel") || text.includes("diesel")) {
    return {
      category: "Fuel",
      flag: "company",
      summary: "AI: fuel purchase — company card / company expense.",
    };
  }
  if (text.includes("food") || text.includes("meal")) {
    return {
      category: "Meals",
      flag: "personal",
      summary: "AI: meal — personal unless per diem policy applies.",
    };
  }
  if (text.includes("toll")) {
    return {
      category: "Toll",
      flag: "reimbursable",
      summary: "AI: toll — reimbursable when approved.",
    };
  }
  if (text.includes("park")) {
    return {
      category: "Parking",
      flag: "reimbursable",
      summary: "AI: parking — request approval for reimbursement.",
    };
  }
  return {
    category: "Other",
    flag: "reimbursable",
    summary: "AI: categorized as other — confirm before sending to payroll.",
  };
}
