import type { DocumentExtractionModelPayload } from "@/lib/alph/document-intake/extraction-contract";
import type { DocumentExtractedFieldKey } from "@/lib/types/documents";

/** Fully fabricated values for deterministic field-contract regression checks. */
export const SANITIZED_RATE_CONFIRMATION_MODEL_PAYLOAD: DocumentExtractionModelPayload = {
  category: "rate_confirmation",
  raw_text: "Sanitized multi-page rate confirmation fixture.",
  overall_confidence: 0.88,
  fields: [
    { key: "broker_name", value: "Example Logistics LLC", confidence: 0.99 },
    { key: "confirmation_number", value: "RC-SAMPLE-001", confidence: 0.98 },
    { key: "total_rate", value: "USD 2,450.00", confidence: 0.97 },
    { key: "pickup_company", value: "Sample Origin Foods", confidence: 0.96 },
    { key: "pickup_city_state", value: "Austin, TX", confidence: 0.95 },
    { key: "pickup_address", value: "100 Example Way", confidence: 0.94 },
    { key: "pickup_date", value: "07/22/2026", confidence: 0.93 },
    { key: "pickup_time", value: "08:00", confidence: 0.91 },
    { key: "delivery_company", value: "Sample Destination Market", confidence: 0.96 },
    { key: "delivery_city_state", value: "Tulsa, OK", confidence: 0.95 },
    { key: "delivery_address", value: "200 Test Avenue", confidence: 0.94 },
    { key: "delivery_date", value: "07/23/2026", confidence: 0.93 },
    { key: "delivery_time", value: "14:30", confidence: 0.91 },
    { key: "commodity", value: "Packaged dry goods", confidence: 0.9 },
    { key: "total_weight", value: "38,000 lb", confidence: 0.89 },
    { key: "equipment_type", value: "53 ft dry van", confidence: 0.92 },
    {
      key: "special_instructions",
      value: "Appointment required; retain signed paperwork.",
      confidence: 0.72,
    },
    { key: "pickup_phone", value: "Not a supported field", confidence: 0.99 },
    { key: "rate", value: "USD 2,400.00", confidence: 0.2 },
  ],
  pickup_numbers: [
    {
      value: "PU-SAMPLE-1001",
      label: "Pickup #",
      pickup_stop_reference: "Pickup 1 · Austin, TX",
      confidence: 0.98,
      stop_association_confidence: 0.96,
      display_order: 0,
    },
    {
      value: "PO-SAMPLE-2002",
      label: "PO Number",
      pickup_stop_reference: "Pickup 1 · Austin, TX",
      confidence: 0.95,
      stop_association_confidence: 0.94,
      display_order: 1,
    },
    {
      value: "REL-SAMPLE-3003",
      label: "Release Number",
      pickup_stop_reference: null,
      confidence: 0.91,
      stop_association_confidence: 0,
      display_order: 2,
    },
    {
      value: "REF-SAMPLE-4004",
      label: "Reference Number",
      pickup_stop_reference: "Pickup 2 · Round Rock, TX",
      confidence: 0.82,
      stop_association_confidence: 0.76,
      display_order: 3,
    },
    {
      value: "ORD-SAMPLE-5005",
      label: "Order Number",
      pickup_stop_reference: "Pickup 2 · Round Rock, TX",
      confidence: 0.93,
      stop_association_confidence: 0.91,
      display_order: 4,
    },
    {
      value: "CONF-SAMPLE-6006",
      label: "Confirmation Number",
      pickup_stop_reference: null,
      confidence: 0.87,
      stop_association_confidence: 0,
      display_order: 5,
    },
    {
      value: "PU-SAMPLE-1001",
      label: "Pickup #",
      pickup_stop_reference: "Pickup 1 · Austin, TX",
      confidence: 0.96,
      stop_association_confidence: 0.96,
      display_order: 6,
    },
  ],
};

export const SANITIZED_RATE_CONFIRMATION_EXPECTED_KEYS = [
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
  "equipmentType",
  "commodity",
  "weight",
  "instructions",
] as const satisfies readonly DocumentExtractedFieldKey[];

export const SANITIZED_SPARSE_RATE_CONFIRMATION_PAYLOAD: DocumentExtractionModelPayload = {
  category: "rate_confirmation",
  raw_text: "Sanitized sparse rate confirmation fixture.",
  overall_confidence: 0.41,
  fields: [
    { key: "broker", value: "Example Brokerage", confidence: 0.81 },
    { key: "rate", value: "", confidence: 0.1 },
  ],
  pickup_numbers: [],
};

export const SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES = [
  "PU-SAMPLE-1001",
  "PO-SAMPLE-2002",
  "REL-SAMPLE-3003",
  "REF-SAMPLE-4004",
  "ORD-SAMPLE-5005",
  "CONF-SAMPLE-6006",
] as const;
