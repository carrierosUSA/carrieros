import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { getTruckById } from "@/lib/data/trucks";
import { getTrailerForTruck } from "@/lib/dispatch/load-board";
import {
  getBrokerDetail,
  getDeliveryDetail,
  getPickupDetail,
} from "@/lib/dispatch/load-detail-meta";
import { getLoadService } from "@/lib/services/loads";
import type { Load } from "@/lib/types";
import { TRAILER_TYPE_LABELS } from "@/lib/types";

export type LaneSuggestion = {
  id: string;
  label: string;
  customerId: string;
  brokerId?: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  miles: number;
  rate: number;
  equipmentType: string;
  count: number;
};

export type BrokerProfile = {
  dispatcherName: string;
  phone: string;
  email: string;
  mcNumber: string;
  dotNumber: string;
  paymentTerms: string;
};

export type StopContactProfile = {
  company: string;
  contactName: string;
  phone: string;
  email: string;
};

export type DriverEquipmentProfile = {
  truckId?: string;
  trailerId?: string;
  truckLabel?: string;
  trailerLabel?: string;
  equipmentType?: string;
};

export type SmartLoadFormContext = {
  laneSuggestions: LaneSuggestion[];
  brokerProfiles: Record<string, BrokerProfile>;
  pickupContacts: Record<string, StopContactProfile>;
  deliveryContacts: Record<string, StopContactProfile>;
  driverEquipment: Record<string, DriverEquipmentProfile>;
  equipmentTemperatures: Record<string, string>;
};

const EQUIPMENT_TEMPERATURES: Record<string, string> = {
  "Dry Van": "",
  Reefer: "34°F",
  Flatbed: "",
  "Step Deck": "",
};

const BROKER_PAYMENT_TERMS: Record<string, string> = {
  "broker-capital": "Net 30",
  "broker-freightline": "Quick Pay · Net 15",
};

function brokerEmailFor(brokerId?: string): string | undefined {
  if (brokerId === "broker-capital") {
    return "dispatch@capitalfreight.com";
  }

  if (brokerId === "broker-freightline") {
    return "ops@freightline.com";
  }

  return undefined;
}

function equipmentForLoad(load: Load): string {
  const trailer = getTrailerForTruck(load.truckId);

  if (trailer?.type) {
    return TRAILER_TYPE_LABELS[trailer.type];
  }

  if (load.customerId === "customer-gulf-foods") {
    return "Reefer";
  }

  return "Dry Van";
}

function laneKey(load: Load): string {
  return [
    load.customerId,
    load.brokerId ?? "direct",
    load.origin.city,
    load.origin.state,
    load.destination.city,
    load.destination.state,
  ].join("|");
}

function buildLaneSuggestions(loads: Load[]): LaneSuggestion[] {
  const grouped = new Map<string, { loads: Load[] }>();

  for (const load of loads) {
    if (load.status === "cancelled") {
      continue;
    }

    const key = laneKey(load);
    const bucket = grouped.get(key) ?? { loads: [] };
    bucket.loads.push(load);
    grouped.set(key, bucket);
  }

  return [...grouped.entries()]
    .map(([key, bucket]) => {
      const sample = bucket.loads[0];
      const equipmentType = equipmentForLoad(sample);

      return {
        id: key,
        label: `${sample.origin.city}, ${sample.origin.state} → ${sample.destination.city}, ${sample.destination.state}`,
        customerId: sample.customerId,
        brokerId: sample.brokerId,
        originCity: sample.origin.city,
        originState: sample.origin.state,
        destinationCity: sample.destination.city,
        destinationState: sample.destination.state,
        miles: Math.round(
          bucket.loads.reduce((sum, load) => sum + load.miles, 0) / bucket.loads.length,
        ),
        rate: Math.round(
          bucket.loads.reduce((sum, load) => sum + load.rate, 0) / bucket.loads.length,
        ),
        equipmentType,
        count: bucket.loads.length,
      };
    })
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
}

function buildStopContacts(loads: Load[]) {
  const pickupContacts: Record<string, StopContactProfile> = {};
  const deliveryContacts: Record<string, StopContactProfile> = {};

  for (const load of loads) {
    const customer = getCustomerById(load.customerId);
    const customerName = customer?.name ?? "Customer";

    if (!pickupContacts[load.customerId]) {
      const detail = getPickupDetail(load, customerName);
      pickupContacts[load.customerId] = {
        company: detail.companyName,
        contactName: detail.contactName,
        phone: detail.phone,
        email: detail.email,
      };
    }

    if (!deliveryContacts[load.customerId]) {
      const detail = getDeliveryDetail(load, customerName);
      deliveryContacts[load.customerId] = {
        company: detail.companyName,
        contactName: detail.contactName,
        phone: detail.phone,
        email: detail.email,
      };
    }
  }

  return { pickupContacts, deliveryContacts };
}

function buildBrokerProfiles(brokerIds: string[]): Record<string, BrokerProfile> {
  const profiles: Record<string, BrokerProfile> = {};

  for (const brokerId of brokerIds) {
    const broker = getBrokerById(brokerId);

    if (!broker) {
      continue;
    }

    const detail = getBrokerDetail(broker, brokerEmailFor(brokerId));

    profiles[brokerId] = {
      dispatcherName: detail.dispatcherName,
      phone: detail.phone,
      email: detail.email,
      mcNumber: detail.mcNumber,
      dotNumber: detail.dotNumber,
      paymentTerms: BROKER_PAYMENT_TERMS[brokerId] ?? "Net 30",
    };
  }

  return profiles;
}

function buildDriverEquipment(driverIds: string[]): Record<string, DriverEquipmentProfile> {
  const profiles: Record<string, DriverEquipmentProfile> = {};

  for (const driverId of driverIds) {
    const driver = getDriverById(driverId);

    if (!driver) {
      continue;
    }

    const truck = driver.truckId ? getTruckById(driver.truckId) : undefined;
    const trailer = getTrailerForTruck(driver.truckId);

    profiles[driverId] = {
      truckId: driver.truckId,
      trailerId: trailer?.id,
      truckLabel: truck ? `Unit ${truck.unitNumber}` : undefined,
      trailerLabel: trailer ? `TRL-${trailer.unitNumber}` : undefined,
      equipmentType: trailer?.type ?? "Dry Van",
    };
  }

  return profiles;
}

export async function buildSmartLoadFormContext(
  tenantId: string,
): Promise<SmartLoadFormContext> {
  const loads = await getLoadService().listLoads(tenantId);
  const brokerIds = [...new Set(loads.map((load) => load.brokerId).filter(Boolean))] as string[];
  const driverIds = [...new Set(loads.map((load) => load.driverId).filter(Boolean))] as string[];

  const allDriverIds = [
    ...new Set([
      ...driverIds,
      "onkar-singh",
      "lovepreet-kaur",
      "marcus-reed",
    ]),
  ];

  const { pickupContacts, deliveryContacts } = buildStopContacts(loads);

  return {
    laneSuggestions: buildLaneSuggestions(loads),
    brokerProfiles: buildBrokerProfiles(brokerIds),
    pickupContacts,
    deliveryContacts,
    driverEquipment: buildDriverEquipment(allDriverIds),
    equipmentTemperatures: EQUIPMENT_TEMPERATURES,
  };
}

export function getBrokerAutofill(
  context: SmartLoadFormContext,
  brokerId: string,
): Partial<BrokerProfile> | null {
  if (!brokerId) {
    return null;
  }

  return context.brokerProfiles[brokerId] ?? null;
}

export function getTemperatureForEquipment(
  context: SmartLoadFormContext,
  equipmentType: string,
): string {
  return context.equipmentTemperatures[equipmentType] ?? "";
}

export function getDefaultCustomerForBroker(
  context: SmartLoadFormContext,
  brokerId: string,
): string | undefined {
  if (!brokerId) {
    return undefined;
  }

  const lane = context.laneSuggestions.find((entry) => entry.brokerId === brokerId);
  return lane?.customerId;
}

export function parseAddressToCityState(address: string): { city: string; state: string } {
  const parts = address.split(",").map((part) => part.trim());

  if (parts.length >= 3) {
    const city = parts[parts.length - 2] ?? "";
    const statePart = parts[parts.length - 1] ?? "";
    return { city, state: statePart.split(/\s+/)[0] ?? "" };
  }

  if (parts.length === 2) {
    const statePart = parts[1] ?? "";
    return { city: parts[0] ?? "", state: statePart.split(/\s+/)[0] ?? "" };
  }

  return { city: "", state: "" };
}

export function filterLaneSuggestions(
  context: SmartLoadFormContext,
  customerId?: string,
  brokerId?: string,
): LaneSuggestion[] {
  return context.laneSuggestions.filter((lane) => {
    if (customerId && lane.customerId !== customerId) {
      return false;
    }

    if (brokerId && lane.brokerId !== brokerId) {
      return false;
    }

    return true;
  });
}

export function loadToFormDefaults(load: Load, customerName: string) {
  const pickup = getPickupDetail(load, customerName);
  const delivery = getDeliveryDetail(load, customerName);
  const broker = load.brokerId ? getBrokerById(load.brokerId) : undefined;
  const brokerDetail = getBrokerDetail(broker, brokerEmailFor(load.brokerId));
  const trailer = getTrailerForTruck(load.truckId);

  return {
    customerId: load.customerId,
    brokerId: load.brokerId ?? "",
    driverId: load.driverId ?? "",
    truckId: load.truckId ?? "",
    trailerId: trailer?.id ?? "",
    equipmentType: load.equipmentType ?? trailer?.type ?? equipmentForLoad(load),
    temperature: load.temperature ?? "",
    paymentTerms:
      load.paymentTerms ??
      (load.brokerId ? BROKER_PAYMENT_TERMS[load.brokerId] : "Direct · No broker hold"),
    brokerContactName: load.brokerContactName ?? brokerDetail.dispatcherName,
    brokerPhone: load.brokerPhone ?? brokerDetail.phone,
    brokerEmail: load.brokerEmail ?? brokerDetail.email,
    pickupDate: load.pickupDate,
    deliveryDate: load.deliveryDate,
    rate: String(load.rate),
    miles: String(load.miles),
    status: load.status,
    originCity: load.origin.city,
    originState: load.origin.state,
    originAddress: load.origin.address ?? "",
    originDate: load.pickupDate,
    originTime: load.origin.scheduledAt
      ? new Date(load.origin.scheduledAt).toISOString().slice(11, 16)
      : "",
    originAppointmentType: load.origin.appointmentType ?? "apt",
    originScheduledAt: load.origin.scheduledAt ?? "",
    originCompany: load.origin.company ?? pickup.companyName,
    originContactName: load.origin.contactName ?? pickup.contactName,
    originPhone: load.origin.phone ?? pickup.phone,
    originEmail: load.origin.email ?? pickup.email,
    destinationCity: load.destination.city,
    destinationState: load.destination.state,
    destinationAddress: load.destination.address ?? "",
    destinationDate: load.deliveryDate,
    destinationTime: load.destination.scheduledAt
      ? new Date(load.destination.scheduledAt).toISOString().slice(11, 16)
      : "",
    destinationAppointmentType: load.destination.appointmentType ?? "fcfs",
    destinationScheduledAt: load.destination.scheduledAt ?? "",
    destinationCompany: load.destination.company ?? delivery.companyName,
    destinationContactName: load.destination.contactName ?? delivery.contactName,
    destinationPhone: load.destination.phone ?? delivery.phone,
    destinationEmail: load.destination.email ?? delivery.email,
    loadNumber: load.loadNumber ?? load.reference,
    brokerLoadId: load.brokerLoadId ?? "",
    poNumber: load.poNumber ?? "",
    commodity: load.commodity ?? "",
    weight: load.weight ? String(load.weight) : "",
    pieces: load.pieces ? String(load.pieces) : "",
    notes: load.notes ?? "",
  };
}

export type SmartLoadFormDefaults = ReturnType<typeof loadToFormDefaults>;

export function emptySmartLoadFormDefaults(): SmartLoadFormDefaults {
  return {
    customerId: "",
    brokerId: "",
    driverId: "",
    truckId: "",
    trailerId: "",
    equipmentType: "Dry Van",
    temperature: "",
    paymentTerms: "",
    brokerContactName: "",
    brokerPhone: "",
    brokerEmail: "",
    pickupDate: "",
    deliveryDate: "",
    rate: "",
    miles: "",
    status: "pending",
    originCity: "",
    originState: "",
    originAddress: "",
    originDate: "",
    originTime: "",
    originAppointmentType: "apt",
    originScheduledAt: "",
    originCompany: "",
    originContactName: "",
    originPhone: "",
    originEmail: "",
    destinationCity: "",
    destinationState: "",
    destinationAddress: "",
    destinationDate: "",
    destinationTime: "",
    destinationAppointmentType: "fcfs",
    destinationScheduledAt: "",
    destinationCompany: "",
    destinationContactName: "",
    destinationPhone: "",
    destinationEmail: "",
    loadNumber: "",
    brokerLoadId: "",
    poNumber: "",
    commodity: "",
    weight: "",
    pieces: "",
    notes: "",
  };
}
