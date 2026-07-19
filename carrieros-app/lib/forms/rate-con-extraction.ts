import type { SmartLoadFormDefaults } from "@/lib/forms/smart-load-intelligence";

export type RateConExtractionStatus = "idle" | "processing" | "ready" | "error";

export type RateConExtractedField = {
  key: keyof SmartLoadFormDefaults | "brokerRequirements" | "detention" | "lumper";
  label: string;
  value: string;
  confidence: number;
};

export type RateConExtractionResult = {
  fileName: string;
  extractedAt: string;
  fields: RateConExtractedField[];
};

const MOCK_EXTRACTION: Omit<RateConExtractionResult, "fileName" | "extractedAt"> = {
  fields: [
    { key: "rate", label: "Rate", value: "2850", confidence: 0.98 },
    { key: "miles", label: "Miles", value: "742", confidence: 0.95 },
    { key: "originCompany", label: "Pickup company", value: "Gulf Foods DC", confidence: 0.92 },
    {
      key: "originAddress",
      label: "Pickup address",
      value: "4200 Industrial Blvd, Houston, TX 77029",
      confidence: 0.91,
    },
    { key: "originDate", label: "Pickup date", value: "2026-07-18", confidence: 0.97 },
    { key: "originTime", label: "Pickup time", value: "08:00", confidence: 0.94 },
    { key: "originAppointmentType", label: "Pickup appointment", value: "apt", confidence: 0.88 },
    {
      key: "destinationCompany",
      label: "Delivery company",
      value: "Midwest Grocers",
      confidence: 0.93,
    },
    {
      key: "destinationAddress",
      label: "Delivery address",
      value: "880 Warehouse Way, Chicago, IL 60609",
      confidence: 0.9,
    },
    { key: "destinationDate", label: "Delivery date", value: "2026-07-20", confidence: 0.96 },
    { key: "destinationTime", label: "Delivery time", value: "14:00", confidence: 0.93 },
    {
      key: "destinationAppointmentType",
      label: "Delivery appointment",
      value: "fcfs",
      confidence: 0.87,
    },
    { key: "temperature", label: "Temperature", value: "34°F", confidence: 0.99 },
    { key: "equipmentType", label: "Equipment", value: "Reefer", confidence: 0.96 },
    { key: "commodity", label: "Commodity", value: "Frozen poultry", confidence: 0.89 },
    { key: "weight", label: "Weight (lbs)", value: "42000", confidence: 0.85 },
    { key: "brokerLoadId", label: "Broker load ID", value: "CF-88421", confidence: 0.94 },
    {
      key: "brokerRequirements",
      label: "Broker requirements",
      value: "Seal intact · No lumpers without approval",
      confidence: 0.82,
    },
    { key: "detention", label: "Detention", value: "$50/hr after 2 free hours", confidence: 0.8 },
    { key: "lumper", label: "Lumper", value: "Reimbursed with receipt", confidence: 0.78 },
  ],
};

export async function extractRateConfirmation(
  file: File,
): Promise<RateConExtractionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Rate confirmation must be a PDF.");
  }

  return {
    fileName: file.name,
    extractedAt: new Date().toISOString(),
    ...MOCK_EXTRACTION,
  };
}

export function applyExtractionToForm(
  extraction: RateConExtractionResult,
): Partial<SmartLoadFormDefaults> {
  const patch: Partial<SmartLoadFormDefaults> = {};

  for (const field of extraction.fields) {
    if (
      field.key === "brokerRequirements" ||
      field.key === "detention" ||
      field.key === "lumper"
    ) {
      continue;
    }

    (patch as Record<string, string>)[field.key] = field.value;
  }

  if (patch.originAddress) {
    const parsed = parseCityStateFromAddress(patch.originAddress);
    patch.originCity = parsed.city;
    patch.originState = parsed.state;
  }

  if (patch.destinationAddress) {
    const parsed = parseCityStateFromAddress(patch.destinationAddress);
    patch.destinationCity = parsed.city;
    patch.destinationState = parsed.state;
  }

  if (patch.originDate) {
    patch.pickupDate = patch.originDate;
  }

  if (patch.destinationDate) {
    patch.deliveryDate = patch.destinationDate;
  }

  const requirements = extraction.fields.find((field) => field.key === "brokerRequirements");
  const detention = extraction.fields.find((field) => field.key === "detention");
  const lumper = extraction.fields.find((field) => field.key === "lumper");

  const noteParts = [requirements?.value, detention?.value, lumper?.value].filter(Boolean);
  if (noteParts.length > 0) {
    patch.notes = noteParts.join(" · ");
  }

  return patch;
}

export function parseCityStateFromAddress(address: string): { city: string; state: string } {
  const parts = address.split(",").map((part) => part.trim());

  if (parts.length >= 3) {
    const city = parts[parts.length - 2] ?? "";
    const statePart = parts[parts.length - 1] ?? "";
    const state = statePart.split(/\s+/)[0] ?? "";
    return { city, state };
  }

  if (parts.length === 2) {
    const statePart = parts[1] ?? "";
    return { city: parts[0] ?? "", state: statePart.split(/\s+/)[0] ?? "" };
  }

  return { city: "", state: "" };
}
