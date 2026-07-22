import type {
  DocumentCategory,
  DocumentExtractedField,
  DocumentExtractedFieldKey,
} from "@/lib/types/documents";
import type { DocumentExtraction } from "@/lib/alph/document-intake/types";
import { normalizePickupNumbers } from "@/lib/loads/pickup-numbers";
import type { PickupNumberInput } from "@/lib/types/pickup-number";

export const DOCUMENT_EXTRACTION_PROMPT_VERSION = "document-intake-v3-pickup-numbers";

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
  "loadNumber",
  "broker",
  "brokerLoadId",
  "driver",
  "truck",
  "trailer",
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
  "rate",
  "miles",
  "equipmentType",
  "commodity",
  "weight",
  "pieces",
  "receiver",
  "invoiceNumber",
  "poNumber",
  "bolNumber",
  "temperature",
  "detention",
  "lumper",
  "instructions",
  "date",
  "time",
] as const satisfies readonly DocumentExtractedFieldKey[];

export const RATE_CONFIRMATION_FIELD_KEYS = [
  "broker",
  "loadNumber",
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
  pickup_numbers?: unknown;
};

type ModelField = {
  key?: unknown;
  label?: unknown;
  value?: unknown;
  confidence?: unknown;
};

type ModelPickupNumber = {
  value?: unknown;
  label?: unknown;
  pickup_stop_reference?: unknown;
  confidence?: unknown;
  stop_association_confidence?: unknown;
  display_order?: unknown;
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

function category(value: unknown): DocumentExtraction["category"] {
  if (
    typeof value === "string" &&
    (DOCUMENT_EXTRACTION_CATEGORIES as readonly string[]).includes(value)
  ) {
    const normalized: DocumentCategory =
      value === "unknown" ? "miscellaneous" : (value as DocumentCategory);
    return normalized as DocumentExtraction["category"];
  }
  return "miscellaneous";
}

export function normalizeDocumentExtractionPayload(
  payload: DocumentExtractionModelPayload,
  modelId: string,
): DocumentExtraction {
  const normalizedByKey = new Map<
    DocumentExtractedFieldKey,
    DocumentExtractedField
  >();
  const modelFields = Array.isArray(payload.fields)
    ? (payload.fields as ModelField[]).slice(0, 100)
    : [];

  for (const modelField of modelFields) {
    if (!modelField || typeof modelField !== "object") continue;
    const key = canonicalFieldKey(modelField.key);
    const value =
      typeof modelField.value === "string" ? modelField.value.trim() : "";
    if (!key || !value) continue;

    const field: DocumentExtractedField = {
      key,
      label: FIELD_LABELS[key],
      value: value.slice(0, 4_000),
      confidence: confidence(modelField.confidence),
    };
    const current = normalizedByKey.get(key);
    if (!current || field.confidence > current.confidence) {
      normalizedByKey.set(key, field);
    }
  }

  const fields = [...normalizedByKey.values()].sort(
    (left, right) =>
      (FIELD_ORDER.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
      (FIELD_ORDER.get(right.key) ?? Number.MAX_SAFE_INTEGER),
  );
  const modelPickupNumbers = Array.isArray(payload.pickup_numbers)
    ? (payload.pickup_numbers as ModelPickupNumber[]).slice(0, 100)
    : [];
  const pickupCandidates: PickupNumberInput[] = modelPickupNumbers.flatMap(
    (entry, index) => {
      if (!entry || typeof entry !== "object") return [];
      const value =
        typeof entry.value === "string" ? entry.value.trim().slice(0, 500) : "";
      if (!value) return [];
      const label =
        typeof entry.label === "string"
          ? entry.label.trim().slice(0, 120) || undefined
          : undefined;
      const pickupStopLabel =
        typeof entry.pickup_stop_reference === "string"
          ? entry.pickup_stop_reference.trim().slice(0, 500) || undefined
          : undefined;
      const valueConfidence = confidence(entry.confidence);
      const stopConfidence = confidence(entry.stop_association_confidence);
      return [
        {
          value,
          label,
          pickupStopLabel,
          displayOrder:
            typeof entry.display_order === "number" &&
            Number.isInteger(entry.display_order) &&
            entry.display_order >= 0
              ? entry.display_order
              : index,
          confidence: valueConfidence,
          stopAssociationConfidence: stopConfidence,
          requiresHumanVerification: valueConfidence < 0.85,
          requiresStopAssociationReview:
            !pickupStopLabel || stopConfidence < 0.85,
          source: "ocr" as const,
        },
      ];
    },
  );
  const pickupNumbers = normalizePickupNumbers(
    pickupCandidates.sort((left, right) => left.displayOrder - right.displayOrder),
  );

  return {
    category: category(payload.category),
    rawText:
      typeof payload.raw_text === "string" ? payload.raw_text : "",
    fields,
    pickupNumbers,
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
