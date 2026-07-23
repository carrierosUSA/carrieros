import type {
  DocumentCategory,
  DocumentExtractedField,
  DocumentExtractedFieldKey,
} from "@/lib/types/documents";
import { DOCUMENT_EXTRACTED_FIELD_KEYS } from "@/lib/types/documents";
import type { DocumentExtraction } from "@/lib/alph/document-intake/types";

export const DOCUMENT_EXTRACTION_PROMPT_VERSION =
  "document-intake-v2-rate-confirmation";

export const DOCUMENT_EXTRACTION_CATEGORIES = [
  "rate_confirmation",
  "bol",
  "pod",
  "lumper_receipt",
  "fuel_receipt",
  "invoice",
  "unknown",
] as const;

export const DOCUMENT_EXTRACTION_FIELD_KEYS = [
  ...DOCUMENT_EXTRACTED_FIELD_KEYS,
] as const satisfies readonly DocumentExtractedFieldKey[];

export const RATE_CONFIRMATION_FIELD_KEYS = [
  "loadNumber",
  "broker",
  "rate",
  "pickup",
  "pickupCityState",
  "pickupAddress",
  "pickupDate",
  "pickupTime",
  "delivery",
  "deliveryCityState",
  "deliveryAddress",
  "deliveryDate",
  "deliveryTime",
  "commodity",
  "weight",
  "equipmentType",
  "instructions",
] as const satisfies readonly DocumentExtractedFieldKey[];

const FIELD_LABELS: Record<DocumentExtractedFieldKey, string> = {
  loadNumber: "Load / confirmation number",
  broker: "Broker / company",
  brokerLoadId: "Broker load ID",
  driver: "Driver",
  truck: "Truck",
  trailer: "Trailer",
  pickup: "Pickup company",
  pickupCityState: "Pickup city / state",
  pickupAddress: "Pickup address",
  pickupDate: "Pickup date",
  pickupTime: "Pickup time",
  delivery: "Delivery company",
  deliveryCityState: "Delivery city / state",
  deliveryAddress: "Delivery address",
  deliveryDate: "Delivery date",
  deliveryTime: "Delivery time",
  rate: "Total rate",
  miles: "Miles",
  equipmentType: "Equipment type",
  commodity: "Commodity",
  weight: "Weight",
  pieces: "Pieces",
  receiver: "Receiver",
  invoiceNumber: "Invoice number",
  poNumber: "PO number",
  bolNumber: "BOL number",
  temperature: "Temperature",
  detention: "Detention",
  lumper: "Lumper",
  instructions: "Important instructions",
  date: "Date",
  time: "Time",
};

const FIELD_ORDER = new Map<DocumentExtractedFieldKey, number>(
  DOCUMENT_EXTRACTION_FIELD_KEYS.map((key, index) => [key, index]),
);
const RATE_CONFIRMATION_FIELD_ORDER = new Map<
  DocumentExtractedFieldKey,
  number
>(RATE_CONFIRMATION_FIELD_KEYS.map((key, index) => [key, index]));

function keyToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

const FIELD_KEY_BY_TOKEN = new Map<string, DocumentExtractedFieldKey>(
  DOCUMENT_EXTRACTION_FIELD_KEYS.map((key) => [keyToken(key), key]),
);

const FIELD_ALIASES: Record<string, DocumentExtractedFieldKey> = {
  brokername: "broker",
  brokercompany: "broker",
  brokerage: "broker",
  confirmationnumber: "loadNumber",
  confirmationid: "loadNumber",
  rateconfirmationnumber: "loadNumber",
  rcnumber: "loadNumber",
  loadid: "loadNumber",
  totalrate: "rate",
  agreedrate: "rate",
  ratetotal: "rate",
  pickupcompany: "pickup",
  origincompany: "pickup",
  shippercompany: "pickup",
  pickupcitystate: "pickupCityState",
  origincitystate: "pickupCityState",
  pickuplocation: "pickupCityState",
  pickupstreetaddress: "pickupAddress",
  originaddress: "pickupAddress",
  pickupappointmentdate: "pickupDate",
  origindate: "pickupDate",
  pickupappointmenttime: "pickupTime",
  origintime: "pickupTime",
  deliverycompany: "delivery",
  destinationcompany: "delivery",
  consigneecompany: "delivery",
  deliverycitystate: "deliveryCityState",
  destinationcitystate: "deliveryCityState",
  deliverylocation: "deliveryCityState",
  deliverystreetaddress: "deliveryAddress",
  destinationaddress: "deliveryAddress",
  deliveryappointmentdate: "deliveryDate",
  destinationdate: "deliveryDate",
  deliveryappointmenttime: "deliveryTime",
  destinationtime: "deliveryTime",
  freightdescription: "commodity",
  totalweight: "weight",
  equipment: "equipmentType",
  trailertype: "equipmentType",
  specialinstructions: "instructions",
  driverinstructions: "instructions",
  handlinginstructions: "instructions",
};

Object.entries(FIELD_ALIASES).forEach(([alias, key]) => {
  FIELD_KEY_BY_TOKEN.set(alias, key);
});

export type DocumentExtractionModelPayload = {
  category?: unknown;
  raw_text?: unknown;
  overall_confidence?: unknown;
  fields?: unknown;
};

type ModelField = {
  key?: unknown;
  value?: unknown;
  confidence?: unknown;
};

function confidence(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(1, Math.max(0, parsed));
}

function canonicalFieldKey(value: unknown): DocumentExtractedFieldKey | null {
  if (typeof value !== "string") return null;
  return FIELD_KEY_BY_TOKEN.get(keyToken(value)) ?? null;
}

function normalizedCategory(value: unknown): DocumentExtraction["category"] {
  if (
    typeof value === "string" &&
    (DOCUMENT_EXTRACTION_CATEGORIES as readonly string[]).includes(value)
  ) {
    const category: DocumentCategory =
      value === "unknown" ? "miscellaneous" : (value as DocumentCategory);
    return category as DocumentExtraction["category"];
  }
  return "miscellaneous";
}

export function normalizeDocumentExtractionPayload(
  payload: DocumentExtractionModelPayload,
  modelId: string,
): DocumentExtraction {
  const category = normalizedCategory(payload.category);
  const fieldOrder =
    category === "rate_confirmation" ? RATE_CONFIRMATION_FIELD_ORDER : FIELD_ORDER;
  const normalizedByKey = new Map<
    DocumentExtractedFieldKey,
    DocumentExtractedField
  >();
  const fields = Array.isArray(payload.fields)
    ? (payload.fields as ModelField[]).slice(0, 100)
    : [];

  for (const modelField of fields) {
    if (!modelField || typeof modelField !== "object") continue;
    const key = canonicalFieldKey(modelField.key);
    const value =
      typeof modelField.value === "string" ? modelField.value.trim() : "";
    if (!key || !value) continue;
    const fieldConfidence = confidence(modelField.confidence);
    const field: DocumentExtractedField = {
      key,
      label: FIELD_LABELS[key],
      value: value.slice(0, 4_000),
      confidence: fieldConfidence,
      needsHumanVerification: fieldConfidence < 0.85,
    };
    const current = normalizedByKey.get(key);
    if (!current || field.confidence > current.confidence) {
      normalizedByKey.set(key, field);
    }
  }

  return {
    category,
    rawText: typeof payload.raw_text === "string" ? payload.raw_text : "",
    fields: [...normalizedByKey.values()].sort(
      (left, right) =>
        (fieldOrder.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
        (fieldOrder.get(right.key) ?? Number.MAX_SAFE_INTEGER),
    ),
    overallConfidence: confidence(payload.overall_confidence),
    provider: "openai",
    modelId,
    promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
  };
}

export function getDocumentExtractionFieldLabel(
  key: DocumentExtractedFieldKey,
): string {
  return FIELD_LABELS[key];
}
