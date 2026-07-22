import type {
  PickupNumber,
  PickupNumberInput,
} from "@/lib/types/pickup-number";

export const MAX_PICKUP_NUMBERS = 100;
export const MAX_PICKUP_NUMBER_VALUE_LENGTH = 500;
export const MAX_PICKUP_NUMBER_LABEL_LENGTH = 120;
export const MAX_PICKUP_STOP_REFERENCE_LENGTH = 500;

function normalizedToken(value?: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLocaleUpperCase();
}

/** Exact duplicate means the value, optional type, and optional stop all match. */
export function pickupNumberFingerprint(
  entry: Pick<
    PickupNumberInput,
    "value" | "label" | "pickupStopId" | "pickupStopLabel"
  >,
): string {
  return [
    normalizedToken(entry.value),
    normalizedToken(entry.label),
    normalizedToken(entry.pickupStopId),
    normalizedToken(entry.pickupStopLabel),
  ].join("\u001f");
}

export function normalizePickupNumbers(
  entries: PickupNumberInput[],
): PickupNumberInput[] {
  if (entries.length > MAX_PICKUP_NUMBERS) {
    throw new Error(`No more than ${MAX_PICKUP_NUMBERS} pickup numbers are allowed.`);
  }

  const seen = new Set<string>();
  const normalized: PickupNumberInput[] = [];
  for (const entry of entries) {
    const value = entry.value.trim().replace(/\s+/g, " ");
    const label = entry.label?.trim().replace(/\s+/g, " ") || undefined;
    const pickupStopId = entry.pickupStopId?.trim() || undefined;
    const pickupStopLabel =
      entry.pickupStopLabel?.trim().replace(/\s+/g, " ") || undefined;

    if (!value) continue;
    if (value.length > MAX_PICKUP_NUMBER_VALUE_LENGTH) {
      throw new Error("A pickup number is too long.");
    }
    if (label && label.length > MAX_PICKUP_NUMBER_LABEL_LENGTH) {
      throw new Error("A pickup number label is too long.");
    }
    if (
      pickupStopLabel &&
      pickupStopLabel.length > MAX_PICKUP_STOP_REFERENCE_LENGTH
    ) {
      throw new Error("A pickup stop reference is too long.");
    }

    const candidate: PickupNumberInput = {
      ...entry,
      value,
      label,
      pickupStopId,
      pickupStopLabel,
      displayOrder: normalized.length,
    };
    const fingerprint = pickupNumberFingerprint(candidate);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    normalized.push(candidate);
  }
  return normalized;
}

export function orderedPickupNumbers(
  entries?: readonly PickupNumber[],
): PickupNumber[] {
  return [...(entries ?? [])]
    .filter((entry) => entry.value.trim().length > 0)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export function formatPickupNumberLabel(entry: PickupNumber): string {
  const type = entry.label?.trim() || "PICKUP NUMBER";
  const stop = entry.pickupStopLabel?.trim();
  return stop ? `${type} · ${stop}` : type;
}
