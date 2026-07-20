/**
 * Deterministic demo OCR — filename/heuristic seed parsers.
 * Clearly labeled isDemoExtraction=true. Never claims live LLM/OCR.
 */

import type {
  DocumentCategory,
  DocumentEntityLinks,
  DocumentExtractedField,
} from "@/lib/types/documents";
import type {
  AlphOcrExtractInput,
  AlphOcrExtractResult,
  AlphOcrIssue,
  AlphOcrProvider,
} from "@/lib/alph/ocr/types";

const CATEGORY_FROM_FILENAME: Array<{
  match: RegExp;
  category: DocumentCategory;
}> = [
  { match: /rate[-_ ]?con|rateconfirmation|rc[-_]/i, category: "rate_confirmation" },
  { match: /\bpod\b|proof[-_ ]?of[-_ ]?delivery/i, category: "pod" },
  { match: /\bbol\b|bill[-_ ]?of[-_ ]?lading/i, category: "bol" },
  { match: /invoice|inv[-_]/i, category: "invoice" },
  { match: /lumper/i, category: "lumper_receipt" },
  { match: /fuel/i, category: "fuel_receipt" },
  { match: /unreadable|corrupt|blank/i, category: "miscellaneous" },
];

function inferCategory(
  fileName: string,
  hint?: DocumentCategory,
): DocumentCategory {
  if (hint) return hint;
  for (const rule of CATEGORY_FROM_FILENAME) {
    if (rule.match.test(fileName)) return rule.category;
  }
  return "miscellaneous";
}

function extractLoadNumber(fileName: string): string | undefined {
  const match = fileName.match(/LD[-_ ]?(\d{4,})/i);
  return match ? `LD-${match[1]}` : undefined;
}

function parseMoney(value: string): number | undefined {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function fieldsFor(
  category: DocumentCategory,
  fileName: string,
): DocumentExtractedField[] {
  const loadNumber = extractLoadNumber(fileName);
  const lowConfidence = /low[-_]?conf|partial/i.test(fileName);
  const conf = (high: number) => (lowConfidence ? high * 0.55 : high);

  switch (category) {
    case "rate_confirmation":
      return [
        {
          key: "loadNumber",
          label: "Load Number",
          value: loadNumber ?? "LD-NEW",
          confidence: conf(0.96),
        },
        {
          key: "broker",
          label: "Broker",
          value: "FreightLine Logistics",
          confidence: conf(0.93),
        },
        {
          key: "brokerLoadId",
          label: "Broker Load ID",
          value: "CF-88421",
          confidence: conf(0.94),
        },
        {
          key: "pickup",
          label: "Pickup",
          value: "Houston, TX",
          confidence: conf(0.91),
        },
        {
          key: "pickupAddress",
          label: "Pickup address",
          value: "4200 Industrial Blvd, Houston, TX 77029",
          confidence: conf(0.9),
        },
        {
          key: "delivery",
          label: "Delivery",
          value: "Chicago, IL",
          confidence: conf(0.9),
        },
        {
          key: "deliveryAddress",
          label: "Delivery address",
          value: "880 Warehouse Way, Chicago, IL 60609",
          confidence: conf(0.89),
        },
        {
          key: "rate",
          label: "Rate",
          value: "$2,850",
          confidence: conf(0.95),
        },
        {
          key: "miles",
          label: "Miles",
          value: "742",
          confidence: conf(0.92),
        },
        {
          key: "pickupDate",
          label: "Pickup Date",
          value: "2026-07-18",
          confidence: conf(0.94),
        },
        {
          key: "deliveryDate",
          label: "Delivery Date",
          value: "2026-07-20",
          confidence: conf(0.93),
        },
        {
          key: "equipmentType",
          label: "Equipment",
          value: "Reefer",
          confidence: conf(0.91),
        },
        {
          key: "temperature",
          label: "Temperature",
          value: "34°F",
          confidence: conf(0.88),
        },
        {
          key: "commodity",
          label: "Commodity",
          value: "Frozen poultry",
          confidence: conf(0.86),
        },
        {
          key: "weight",
          label: "Weight (lbs)",
          value: "42000",
          confidence: conf(0.84),
        },
      ];
    case "pod":
      return [
        {
          key: "loadNumber",
          label: "Load Number",
          value: loadNumber ?? "LD-24002",
          confidence: conf(0.97),
        },
        {
          key: "driver",
          label: "Driver",
          value: "Onkar Singh",
          confidence: conf(0.9),
        },
        {
          key: "truck",
          label: "Truck",
          value: "Unit 102",
          confidence: conf(0.88),
        },
        {
          key: "delivery",
          label: "Delivery",
          value: "Houston, TX",
          confidence: conf(0.92),
        },
        {
          key: "date",
          label: "Delivery Date",
          value: "2026-07-17",
          confidence: conf(0.94),
        },
        {
          key: "time",
          label: "Delivery Time",
          value: "14:30",
          confidence: conf(0.85),
        },
        {
          key: "receiver",
          label: "Receiver signature",
          value: "Maria Santos",
          confidence: conf(0.91),
        },
        {
          key: "pieces",
          label: "Pieces",
          value: "24",
          confidence: conf(0.87),
        },
      ];
    default:
      return [
        {
          key: "date",
          label: "Date",
          value: "2026-07-17",
          confidence: conf(0.7),
        },
      ];
  }
}

function suggestLinks(
  category: DocumentCategory,
  fields: DocumentExtractedField[],
): DocumentEntityLinks {
  const links: DocumentEntityLinks = { companyId: "company-demo-001" };
  const loadNumber = fields.find((f) => f.key === "loadNumber")?.value;
  const broker =
    fields.find((f) => f.key === "broker")?.value?.toLowerCase() ?? "";
  const driver =
    fields.find((f) => f.key === "driver")?.value?.toLowerCase() ?? "";
  const truck = fields.find((f) => f.key === "truck")?.value ?? "";

  if (loadNumber) {
    const digits = loadNumber.replace(/\D/g, "");
    if (digits && digits !== "0000" && !loadNumber.includes("NEW")) {
      links.loadId = `load-${digits}`;
    }
  }
  if (broker.includes("freightline")) links.brokerId = "broker-freightline";
  else if (broker.includes("capital")) links.brokerId = "broker-capital";
  else if (broker.includes("horizon")) links.brokerId = "broker-horizon";

  if (driver.includes("onkar")) links.driverId = "onkar-singh";
  else if (driver.includes("marcus")) links.driverId = "marcus-reed";

  const truckMatch = truck.match(/(\d{2,4})/);
  if (truckMatch) links.truckId = `truck-${truckMatch[1]}`;

  if (category === "rate_confirmation" && !links.brokerId) {
    links.brokerId = "broker-freightline";
  }

  return links;
}

function buildIssues(
  fileName: string,
  fields: DocumentExtractedField[],
  overall: number,
): AlphOcrIssue[] {
  const issues: AlphOcrIssue[] = [];
  if (/unreadable|corrupt|blank/i.test(fileName)) {
    issues.push({
      code: "unreadable",
      message: "Document appears unreadable or blank. Request a clearer scan.",
    });
  }
  if (/missing[-_]?page|page[-_]?2/i.test(fileName)) {
    issues.push({
      code: "missing_pages",
      message: "Possible missing pages detected from filename hint.",
    });
  }
  if (overall < 0.85) {
    issues.push({
      code: "low_confidence",
      message: `Overall extraction confidence ${(overall * 100).toFixed(0)}% is below review threshold.`,
    });
  }
  for (const field of fields) {
    if (field.confidence < 0.8) {
      issues.push({
        code: "missing_fields",
        message: `${field.label} needs review (${(field.confidence * 100).toFixed(0)}% confidence).`,
        fieldKey: field.key,
      });
    }
  }
  return issues;
}

export const demoAlphOcrProvider: AlphOcrProvider = {
  id: "demo",
  displayName: "Demo OCR (seed parsers)",
  getStatus() {
    return "demo";
  },
  statusMessage() {
    return "Demo OCR: deterministic seed parsers — not live OCR.";
  },
  async extract(input: AlphOcrExtractInput): Promise<AlphOcrExtractResult> {
    // Small delay to feel like processing without blocking tests.
    await new Promise((r) => setTimeout(r, 80));

    const category = inferCategory(input.fileName, input.categoryHint);
    const fields = fieldsFor(category, input.fileName);
    const overall =
      fields.reduce((sum, f) => sum + f.confidence, 0) /
      Math.max(fields.length, 1);
    const suggestedLinks = suggestLinks(category, fields);
    const issues = buildIssues(input.fileName, fields, overall);
    const loadNumber = fields.find((f) => f.key === "loadNumber")?.value;

    return {
      providerId: "demo",
      isDemoExtraction: true,
      status: "demo",
      statusMessage: demoAlphOcrProvider.statusMessage(),
      fileName: input.fileName,
      category,
      extractedAt: new Date().toISOString(),
      ocrText: fields.map((f) => `${f.label}: ${f.value}`).join(" · "),
      fields,
      overallConfidence: overall,
      suggestedLinks,
      suggestedTags: [category.replace(/_/g, "-"), "alph-demo-ocr"],
      loadNumber,
      issues,
      originalFileName: input.fileName,
    };
  },
};

export function fieldValue(
  fields: DocumentExtractedField[],
  key: string,
): string | undefined {
  return fields.find((f) => f.key === key)?.value;
}

export function fieldMoney(
  fields: DocumentExtractedField[],
  key: string,
): number | undefined {
  const v = fieldValue(fields, key);
  return v ? parseMoney(v) : undefined;
}
