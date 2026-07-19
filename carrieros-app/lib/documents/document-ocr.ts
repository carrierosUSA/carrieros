import type {
  CarrierDocument,
  DocumentCategory,
  DocumentExtractedField,
  DocumentEntityLinks,
} from "@/lib/types/documents";

export type DocumentOcrStatus = "idle" | "processing" | "ready" | "error";

export type DocumentOcrResult = {
  fileName: string;
  category: DocumentCategory;
  extractedAt: string;
  ocrText: string;
  fields: DocumentExtractedField[];
  suggestedLinks: DocumentEntityLinks;
  suggestedTags: string[];
  loadNumber?: string;
  invoiceNumber?: string;
  poNumber?: string;
  bolNumber?: string;
};

const CATEGORY_FROM_FILENAME: Array<{ match: RegExp; category: DocumentCategory }> = [
  { match: /rate[-_ ]?con|rateconfirmation/i, category: "rate_confirmation" },
  { match: /\bpod\b|proof[-_ ]?of[-_ ]?delivery/i, category: "pod" },
  { match: /\bbol\b|bill[-_ ]?of[-_ ]?lading/i, category: "bol" },
  { match: /invoice|inv[-_]/i, category: "invoice" },
  { match: /lumper/i, category: "lumper_receipt" },
  { match: /fuel/i, category: "fuel_receipt" },
  { match: /scale/i, category: "scale_ticket" },
  { match: /repair/i, category: "repair" },
  { match: /maint|pm[-_ ]?service/i, category: "maintenance" },
  { match: /cdl|medical|driver/i, category: "driver_document" },
  { match: /truck|registration|unit[-_ ]?\d/i, category: "truck_document" },
  { match: /trailer/i, category: "trailer_document" },
  { match: /insurance|coi/i, category: "insurance" },
  { match: /permit/i, category: "permit" },
  { match: /contract|agreement/i, category: "contract" },
  { match: /payroll/i, category: "payroll" },
  { match: /tax|ifta|1099/i, category: "tax" },
];

function inferCategory(fileName: string, hint?: DocumentCategory): DocumentCategory {
  if (hint) {
    return hint;
  }

  for (const rule of CATEGORY_FROM_FILENAME) {
    if (rule.match.test(fileName)) {
      return rule.category;
    }
  }

  return "miscellaneous";
}

function extractLoadNumber(fileName: string): string | undefined {
  const match = fileName.match(/LD[-_ ]?(\d{4,})/i);
  return match ? `LD-${match[1]}` : undefined;
}

function buildFieldsForCategory(
  category: DocumentCategory,
  fileName: string,
): DocumentExtractedField[] {
  const loadNumber = extractLoadNumber(fileName);

  const baseByCategory: Record<DocumentCategory, DocumentExtractedField[]> = {
    rate_confirmation: [
      { key: "loadNumber", label: "Load Number", value: loadNumber ?? "LD-24005", confidence: 0.96 },
      { key: "broker", label: "Broker", value: "Horizon Logistics", confidence: 0.93 },
      { key: "pickup", label: "Pickup", value: "Austin, TX", confidence: 0.91 },
      { key: "delivery", label: "Delivery", value: "Atlanta, GA", confidence: 0.9 },
      { key: "rate", label: "Rate", value: "$3,200", confidence: 0.95 },
      { key: "temperature", label: "Temperature", value: "34°F", confidence: 0.88 },
      { key: "detention", label: "Detention", value: "$50/hr after 2 hrs", confidence: 0.8 },
      { key: "date", label: "Pickup Date", value: "2026-07-18", confidence: 0.92 },
      { key: "time", label: "Pickup Time", value: "08:00", confidence: 0.87 },
    ],
    pod: [
      { key: "loadNumber", label: "Load Number", value: loadNumber ?? "LD-24002", confidence: 0.97 },
      { key: "driver", label: "Driver", value: "Onkar Singh", confidence: 0.9 },
      { key: "delivery", label: "Delivery", value: "Houston, TX", confidence: 0.92 },
      { key: "date", label: "Date", value: "2026-07-17", confidence: 0.94 },
      { key: "time", label: "Time", value: "14:30", confidence: 0.85 },
    ],
    bol: [
      { key: "loadNumber", label: "Load Number", value: loadNumber ?? "LD-24002", confidence: 0.95 },
      { key: "bolNumber", label: "BOL Number", value: "BOL-99102", confidence: 0.94 },
      { key: "broker", label: "Broker", value: "Capital Freight Partners", confidence: 0.9 },
      { key: "truck", label: "Truck", value: "Unit 102", confidence: 0.88 },
    ],
    invoice: [
      { key: "invoiceNumber", label: "Invoice Number", value: "INV-LD-24005", confidence: 0.98 },
      { key: "loadNumber", label: "Load Number", value: loadNumber ?? "LD-24005", confidence: 0.95 },
      { key: "poNumber", label: "PO Number", value: "PO-77421", confidence: 0.9 },
      { key: "rate", label: "Amount", value: "$3,200", confidence: 0.96 },
      { key: "broker", label: "Broker", value: "Horizon Logistics", confidence: 0.89 },
    ],
    lumper_receipt: [
      { key: "loadNumber", label: "Load Number", value: loadNumber ?? "LD-24003", confidence: 0.88 },
      { key: "lumper", label: "Lumper", value: "$175.00", confidence: 0.93 },
      { key: "date", label: "Date", value: "2026-07-17", confidence: 0.9 },
    ],
    fuel_receipt: [
      { key: "truck", label: "Truck", value: "Unit 102", confidence: 0.9 },
      { key: "driver", label: "Driver", value: "Onkar Singh", confidence: 0.86 },
      { key: "rate", label: "Amount", value: "$398.40", confidence: 0.92 },
      { key: "date", label: "Date", value: "2026-07-17", confidence: 0.94 },
    ],
    scale_ticket: [
      { key: "loadNumber", label: "Load Number", value: loadNumber ?? "LD-24004", confidence: 0.91 },
      { key: "truck", label: "Truck", value: "Unit 104", confidence: 0.88 },
      { key: "date", label: "Date", value: "2026-07-17", confidence: 0.9 },
    ],
    repair: [
      { key: "truck", label: "Truck", value: "Unit 102", confidence: 0.92 },
      { key: "rate", label: "Amount", value: "$640.00", confidence: 0.9 },
      { key: "date", label: "Date", value: "2026-07-17", confidence: 0.89 },
    ],
    maintenance: [
      { key: "trailer", label: "Trailer", value: "Trailer 2201", confidence: 0.9 },
      { key: "date", label: "Service Date", value: "2026-07-17", confidence: 0.91 },
    ],
    driver_document: [
      { key: "driver", label: "Driver", value: "Onkar Singh", confidence: 0.95 },
      { key: "date", label: "Expires", value: "2027-01-15", confidence: 0.9 },
    ],
    truck_document: [
      { key: "truck", label: "Truck", value: "Unit 102", confidence: 0.94 },
      { key: "date", label: "Expires", value: "2027-05-01", confidence: 0.91 },
    ],
    trailer_document: [
      { key: "trailer", label: "Trailer", value: "Trailer 2204", confidence: 0.93 },
      { key: "date", label: "Expires", value: "2027-04-01", confidence: 0.9 },
    ],
    insurance: [
      { key: "date", label: "Expires", value: "2027-01-01", confidence: 0.96 },
      { key: "rate", label: "Liability Limit", value: "$1,000,000", confidence: 0.88 },
    ],
    permit: [
      { key: "truck", label: "Truck", value: "Unit 110", confidence: 0.9 },
      { key: "date", label: "Expires", value: "2026-12-31", confidence: 0.92 },
    ],
    contract: [
      { key: "broker", label: "Broker", value: "Capital Freight Partners", confidence: 0.93 },
      { key: "date", label: "Signed", value: "2026-07-17", confidence: 0.88 },
    ],
    payroll: [
      { key: "date", label: "Period", value: "2026-07", confidence: 0.95 },
      { key: "rate", label: "Total", value: "$51,400", confidence: 0.87 },
    ],
    tax: [
      { key: "date", label: "Period", value: "Q2 2026", confidence: 0.94 },
    ],
    miscellaneous: [
      { key: "date", label: "Date", value: "2026-07-17", confidence: 0.75 },
    ],
  };

  return baseByCategory[category];
}

function suggestLinks(
  category: DocumentCategory,
  fields: DocumentExtractedField[],
): DocumentEntityLinks {
  const links: DocumentEntityLinks = { companyId: "company-demo-001" };
  const loadNumber = fields.find((field) => field.key === "loadNumber")?.value;
  const broker = fields.find((field) => field.key === "broker")?.value?.toLowerCase() ?? "";
  const driver = fields.find((field) => field.key === "driver")?.value?.toLowerCase() ?? "";
  const truck = fields.find((field) => field.key === "truck")?.value ?? "";
  const trailer = fields.find((field) => field.key === "trailer")?.value ?? "";

  if (loadNumber) {
    const digits = loadNumber.replace(/\D/g, "");
    if (digits) {
      links.loadId = `load-${digits}`;
    }
  }

  if (broker.includes("capital")) {
    links.brokerId = "broker-capital";
  } else if (broker.includes("freightline")) {
    links.brokerId = "broker-freightline";
  } else if (broker.includes("horizon")) {
    links.brokerId = "broker-horizon";
  }

  if (driver.includes("onkar")) {
    links.driverId = "onkar-singh";
  } else if (driver.includes("marcus")) {
    links.driverId = "marcus-reed";
  } else if (driver.includes("carlos")) {
    links.driverId = "carlos-mendez";
  }

  const truckMatch = truck.match(/(\d{2,4})/);
  if (truckMatch) {
    links.truckId = `truck-${truckMatch[1]}`;
  }

  const trailerMatch = trailer.match(/(\d{3,5})/);
  if (trailerMatch) {
    links.trailerId = `trailer-${trailerMatch[1]}`;
  }

  if (category === "driver_document" && !links.driverId) {
    links.driverId = "onkar-singh";
  }

  if (category === "truck_document" && !links.truckId) {
    links.truckId = "truck-102";
  }

  if (category === "trailer_document" && !links.trailerId) {
    links.trailerId = "trailer-2201";
  }

  return links;
}

export async function extractDocumentWithAlph(
  file: File,
  categoryHint?: DocumentCategory,
): Promise<DocumentOcrResult> {
  await new Promise((resolve) => setTimeout(resolve, 1600));

  const category = inferCategory(file.name, categoryHint);
  const fields = buildFieldsForCategory(category, file.name);
  const suggestedLinks = suggestLinks(category, fields);
  const loadNumber = fields.find((field) => field.key === "loadNumber")?.value;
  const invoiceNumber = fields.find((field) => field.key === "invoiceNumber")?.value;
  const poNumber = fields.find((field) => field.key === "poNumber")?.value;
  const bolNumber = fields.find((field) => field.key === "bolNumber")?.value;

  return {
    fileName: file.name,
    category,
    extractedAt: new Date().toISOString(),
    ocrText: fields.map((field) => `${field.label}: ${field.value}`).join(" · "),
    fields,
    suggestedLinks,
    suggestedTags: [category.replace(/_/g, "-"), "alph-ocr"],
    loadNumber,
    invoiceNumber,
    poNumber,
    bolNumber,
  };
}

export function applyOcrLinksToDocument(
  doc: CarrierDocument,
  result: DocumentOcrResult,
): CarrierDocument {
  return {
    ...doc,
    category: result.category,
    status: "linked",
    ocrText: result.ocrText,
    extractedFields: result.fields,
    tags: Array.from(new Set([...doc.tags, ...result.suggestedTags])),
    links: { ...doc.links, ...result.suggestedLinks },
    loadNumber: result.loadNumber ?? doc.loadNumber,
    invoiceNumber: result.invoiceNumber ?? doc.invoiceNumber,
    poNumber: result.poNumber ?? doc.poNumber,
    bolNumber: result.bolNumber ?? doc.bolNumber,
  };
}
