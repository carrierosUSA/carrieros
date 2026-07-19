import { listBrokersByTenant } from "@/lib/data/brokers";
import { listCompaniesByTenant } from "@/lib/data/companies";
import { seedDrivers } from "@/lib/data/driver-store";
import { seedTrailers, seedTrucks } from "@/lib/data/fleet-store";
import { loads } from "@/lib/data/loads";
import { getActiveTenantId } from "@/lib/data/tenant";
import type {
  EntityOption,
  EntityType,
  LinkedEntities,
} from "@/lib/communications/types";

export function entityHref(type: EntityType, id: string): string {
  switch (type) {
    case "load":
      return `/loads/${id}`;
    case "driver":
      return `/drivers/${id}`;
    case "truck":
      return `/fleet/trucks/${id}`;
    case "trailer":
      return `/fleet/trailers/${id}`;
    case "broker":
      return `/brokers/${id}`;
    case "company":
      return `/companies/${id}`;
    default:
      return "/";
  }
}

export function listEntityOptions(query = ""): EntityOption[] {
  const tenantId = getActiveTenantId();
  const q = query.trim().toLowerCase();

  const options: EntityOption[] = [
    ...loads
      .filter((l) => l.tenantId === tenantId)
      .map((load) => ({
        type: "load" as const,
        id: load.id,
        label: load.reference,
        sublabel: `${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`,
        href: entityHref("load", load.id),
      })),
    ...seedDrivers
      .filter((d) => d.tenantId === tenantId)
      .map((driver) => ({
        type: "driver" as const,
        id: driver.id,
        label: driver.name,
        sublabel: driver.phone,
        href: entityHref("driver", driver.id),
      })),
    ...seedTrucks
      .filter((t) => t.tenantId === tenantId)
      .map((truck) => ({
        type: "truck" as const,
        id: truck.id,
        label: `Unit ${truck.unitNumber}`,
        sublabel: `${truck.year} ${truck.make} ${truck.model}`,
        href: entityHref("truck", truck.id),
      })),
    ...seedTrailers
      .filter((t) => t.tenantId === tenantId)
      .map((trailer) => ({
        type: "trailer" as const,
        id: trailer.id,
        label: `Trailer ${trailer.unitNumber}`,
        sublabel: trailer.type ?? "Trailer",
        href: entityHref("trailer", trailer.id),
      })),
    ...listBrokersByTenant(tenantId).map((broker) => ({
      type: "broker" as const,
      id: broker.id,
      label: broker.name,
      sublabel: "Broker",
      href: entityHref("broker", broker.id),
    })),
    ...listCompaniesByTenant(tenantId).map((company) => ({
      type: "company" as const,
      id: company.id,
      label: company.name,
      sublabel: company.type ?? "Company",
      href: entityHref("company", company.id),
    })),
  ];

  if (!q) return options;

  return options.filter((opt) => {
    const hay = `${opt.label} ${opt.sublabel ?? ""} ${opt.id}`.toLowerCase();
    return hay.includes(q);
  });
}

export function resolveLinkedEntityChips(
  linkedTo: LinkedEntities,
): EntityOption[] {
  const all = listEntityOptions();
  const chips: EntityOption[] = [];

  const pairs: Array<[EntityType, string | undefined]> = [
    ["load", linkedTo.loadId],
    ["driver", linkedTo.driverId],
    ["truck", linkedTo.truckId],
    ["trailer", linkedTo.trailerId],
    ["broker", linkedTo.brokerId],
    ["company", linkedTo.companyId],
  ];

  for (const [type, id] of pairs) {
    if (!id) continue;
    const found = all.find((o) => o.type === type && o.id === id);
    chips.push(
      found ?? {
        type,
        id,
        label: id,
        href: entityHref(type, id),
      },
    );
  }

  return chips;
}

export function applyEntityToLinked(
  linkedTo: LinkedEntities,
  option: EntityOption,
): LinkedEntities {
  const next = { ...linkedTo };
  switch (option.type) {
    case "load":
      next.loadId = option.id;
      break;
    case "driver":
      next.driverId = option.id;
      break;
    case "truck":
      next.truckId = option.id;
      break;
    case "trailer":
      next.trailerId = option.id;
      break;
    case "broker":
      next.brokerId = option.id;
      break;
    case "company":
      next.companyId = option.id;
      break;
  }
  return next;
}

export function removeEntityFromLinked(
  linkedTo: LinkedEntities,
  type: EntityType,
): LinkedEntities {
  const next = { ...linkedTo };
  switch (type) {
    case "load":
      delete next.loadId;
      break;
    case "driver":
      delete next.driverId;
      break;
    case "truck":
      delete next.truckId;
      break;
    case "trailer":
      delete next.trailerId;
      break;
    case "broker":
      delete next.brokerId;
      break;
    case "company":
      delete next.companyId;
      break;
  }
  return next;
}

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  load: "Load",
  driver: "Driver",
  truck: "Truck",
  trailer: "Trailer",
  broker: "Broker",
  company: "Company",
};
