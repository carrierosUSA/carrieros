import type { Load } from "@/lib/types";

export type LoadStatusChipVariant =
  | "ready"
  | "pod_missing"
  | "detention_soon"
  | "driver_delayed"
  | "invoice_ready";

export type LoadStatusChip = {
  id: LoadStatusChipVariant;
  label: string;
  emoji: string;
  variant: LoadStatusChipVariant;
};

const CHIP_PRIORITY: LoadStatusChipVariant[] = [
  "driver_delayed",
  "pod_missing",
  "detention_soon",
  "invoice_ready",
  "ready",
];

const CHIP_DEFINITIONS: Record<
  LoadStatusChipVariant,
  { label: string; emoji: string }
> = {
  ready: { label: "Ready", emoji: "🟢" },
  pod_missing: { label: "POD Missing", emoji: "🟡" },
  detention_soon: { label: "Detention Soon", emoji: "🟠" },
  driver_delayed: { label: "Driver Delayed", emoji: "🔴" },
  invoice_ready: { label: "Invoice Ready", emoji: "🔵" },
};

const MAX_CHIPS = 3;

function isActiveTransit(load: Load): boolean {
  return (
    load.status === "in_transit" ||
    load.status === "picked_up" ||
    load.status === "dispatched"
  );
}

function shouldShowDriverDelayed(isLate: boolean): boolean {
  return isLate;
}

function shouldShowPodMissing(load: Load, hasPod: boolean): boolean {
  if (hasPod || load.status === "pending" || load.status === "cancelled") {
    return false;
  }

  return load.status === "delivered" || load.status === "in_transit";
}

function shouldShowDetentionSoon(load: Load, isLate: boolean): boolean {
  if (load.status === "cancelled") {
    return false;
  }

  if (load.status === "in_transit" && isLate) {
    return true;
  }

  return isActiveTransit(load);
}

function shouldShowInvoiceReady(load: Load, hasPod: boolean): boolean {
  return load.status === "delivered" && hasPod;
}

function shouldShowReady(
  load: Load,
  hasPod: boolean,
  isLate: boolean,
  activeVariants: Set<LoadStatusChipVariant>,
): boolean {
  if (load.status === "cancelled" || isLate) {
    return false;
  }

  if (activeVariants.has("pod_missing") || activeVariants.has("detention_soon")) {
    return false;
  }

  if (shouldShowPodMissing(load, hasPod) || shouldShowDetentionSoon(load, isLate)) {
    return false;
  }

  return true;
}

export function getLoadStatusChips(
  load: Load,
  hasPod: boolean,
  isLate: boolean,
): LoadStatusChip[] {
  if (load.status === "cancelled") {
    return [];
  }

  const variants: LoadStatusChipVariant[] = [];

  if (shouldShowDriverDelayed(isLate)) {
    variants.push("driver_delayed");
  }
  if (shouldShowPodMissing(load, hasPod)) {
    variants.push("pod_missing");
  }
  if (shouldShowDetentionSoon(load, isLate)) {
    variants.push("detention_soon");
  }
  if (shouldShowInvoiceReady(load, hasPod)) {
    variants.push("invoice_ready");
  }

  const activeVariants = new Set(variants);

  if (shouldShowReady(load, hasPod, isLate, activeVariants)) {
    variants.push("ready");
  }

  return variants
    .sort((a, b) => CHIP_PRIORITY.indexOf(a) - CHIP_PRIORITY.indexOf(b))
    .slice(0, MAX_CHIPS)
    .map((variant) => ({
      id: variant,
      label: CHIP_DEFINITIONS[variant].label,
      emoji: CHIP_DEFINITIONS[variant].emoji,
      variant,
    }));
}
