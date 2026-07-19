import type { Load } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

type LaneSeed = {
  id: string;
  ref: string;
  status: Load["status"];
  brokerId?: string;
  customerId: string;
  driverId?: string;
  truckId?: string;
  origin: { city: string; state: string; hour: number };
  dest: { city: string; state: string };
  pickup: string;
  delivery: string;
  rate: number;
  miles: number;
  compliance: Load["complianceStatus"];
  docs: string[];
  invoiceId?: string;
};

const lanes: LaneSeed[] = [
  { id: "load-24006", ref: "LD-24006", status: "pending", brokerId: "broker-capital", customerId: "customer-retail-hub", origin: { city: "Phoenix", state: "AZ", hour: 8 }, dest: { city: "Los Angeles", state: "CA" }, pickup: "2026-07-05", delivery: "2026-07-06", rate: 2100, miles: 372, compliance: "attention", docs: ["doc-ratecon-24006"] },
  { id: "load-24007", ref: "LD-24007", status: "pending", brokerId: "broker-freightline", customerId: "customer-gulf-foods", driverId: "lovepreet-kaur", origin: { city: "Houston", state: "TX", hour: 6 }, dest: { city: "Dallas", state: "TX" }, pickup: "2026-07-05", delivery: "2026-07-05", rate: 680, miles: 239, compliance: "attention", docs: ["doc-ratecon-24007"] },
  { id: "load-24008", ref: "LD-24008", status: "dispatched", brokerId: "broker-freightline", customerId: "customer-midwest-parts", driverId: "onkar-singh", truckId: "truck-102", origin: { city: "Laredo", state: "TX", hour: 9 }, dest: { city: "San Antonio", state: "TX" }, pickup: "2026-07-05", delivery: "2026-07-05", rate: 540, miles: 154, compliance: "clear", docs: ["doc-ratecon-24008", "doc-bol-24008"] },
  { id: "load-24009", ref: "LD-24009", status: "in_transit", brokerId: "broker-capital", customerId: "customer-retail-hub", driverId: "onkar-singh", truckId: "truck-102", origin: { city: "Memphis", state: "TN", hour: 11 }, dest: { city: "Atlanta", state: "GA" }, pickup: "2026-07-04", delivery: "2026-07-05", rate: 1450, miles: 394, compliance: "clear", docs: ["doc-ratecon-24009", "doc-bol-24009"] },
  { id: "load-24010", ref: "LD-24010", status: "in_transit", brokerId: "broker-freightline", customerId: "customer-gulf-foods", driverId: "marcus-reed", truckId: "truck-104", origin: { city: "Chicago", state: "IL", hour: 7 }, dest: { city: "Detroit", state: "MI" }, pickup: "2026-07-04", delivery: "2026-07-05", rate: 920, miles: 283, compliance: "attention", docs: ["doc-ratecon-24010", "doc-bol-24010"] },
  { id: "load-24011", ref: "LD-24011", status: "dispatched", brokerId: "broker-capital", customerId: "customer-midwest-parts", driverId: "lovepreet-kaur", truckId: "truck-104", origin: { city: "Denver", state: "CO", hour: 10 }, dest: { city: "Salt Lake City", state: "UT" }, pickup: "2026-07-05", delivery: "2026-07-06", rate: 1180, miles: 525, compliance: "clear", docs: ["doc-ratecon-24011", "doc-bol-24011"] },
  { id: "load-24012", ref: "LD-24012", status: "pending", brokerId: "broker-freightline", customerId: "customer-retail-hub", origin: { city: "Kansas City", state: "MO", hour: 13 }, dest: { city: "Omaha", state: "NE" }, pickup: "2026-07-06", delivery: "2026-07-06", rate: 710, miles: 189, compliance: "attention", docs: [] },
  { id: "load-24013", ref: "LD-24013", status: "delivered", brokerId: "broker-capital", customerId: "customer-gulf-foods", driverId: "onkar-singh", truckId: "truck-102", origin: { city: "New Orleans", state: "LA", hour: 5 }, dest: { city: "Baton Rouge", state: "LA" }, pickup: "2026-07-03", delivery: "2026-07-03", rate: 480, miles: 81, compliance: "attention", docs: ["doc-ratecon-24013", "doc-bol-24013"] },
  { id: "load-24014", ref: "LD-24014", status: "delivered", brokerId: "broker-freightline", customerId: "customer-midwest-parts", driverId: "marcus-reed", truckId: "truck-104", origin: { city: "Tulsa", state: "OK", hour: 8 }, dest: { city: "Little Rock", state: "AR" }, pickup: "2026-07-02", delivery: "2026-07-03", rate: 830, miles: 245, compliance: "clear", docs: ["doc-ratecon-24014", "doc-bol-24014", "doc-pod-24014"] },
  { id: "load-24015", ref: "LD-24015", status: "invoiced", brokerId: "broker-capital", customerId: "customer-retail-hub", driverId: "onkar-singh", truckId: "truck-102", origin: { city: "Fort Worth", state: "TX", hour: 6 }, dest: { city: "Amarillo", state: "TX" }, pickup: "2026-06-25", delivery: "2026-06-26", rate: 990, miles: 340, compliance: "clear", docs: ["doc-ratecon-24015", "doc-pod-24015"], invoiceId: "invoice-24015" },
  { id: "load-24016", ref: "LD-24016", status: "in_transit", brokerId: "broker-freightline", customerId: "customer-gulf-foods", driverId: "lovepreet-kaur", truckId: "truck-104", origin: { city: "Nashville", state: "TN", hour: 12 }, dest: { city: "Louisville", state: "KY" }, pickup: "2026-07-05", delivery: "2026-07-05", rate: 650, miles: 176, compliance: "clear", docs: ["doc-ratecon-24016", "doc-bol-24016"] },
  { id: "load-24017", ref: "LD-24017", status: "dispatched", brokerId: "broker-capital", customerId: "customer-midwest-parts", driverId: "marcus-reed", truckId: "truck-104", origin: { city: "Indianapolis", state: "IN", hour: 9 }, dest: { city: "Columbus", state: "OH" }, pickup: "2026-07-05", delivery: "2026-07-06", rate: 760, miles: 176, compliance: "clear", docs: ["doc-ratecon-24017", "doc-bol-24017"] },
  { id: "load-24018", ref: "LD-24018", status: "pending", brokerId: "broker-freightline", customerId: "customer-retail-hub", origin: { city: "Miami", state: "FL", hour: 7 }, dest: { city: "Orlando", state: "FL" }, pickup: "2026-07-06", delivery: "2026-07-06", rate: 520, miles: 235, compliance: "attention", docs: ["doc-ratecon-24018"] },
  { id: "load-24019", ref: "LD-24019", status: "in_transit", brokerId: "broker-capital", customerId: "customer-gulf-foods", driverId: "onkar-singh", truckId: "truck-102", origin: { city: "St. Louis", state: "MO", hour: 10 }, dest: { city: "Cincinnati", state: "OH" }, pickup: "2026-07-04", delivery: "2026-07-05", rate: 1320, miles: 350, compliance: "attention", docs: ["doc-ratecon-24019", "doc-bol-24019"] },
  { id: "load-24020", ref: "LD-24020", status: "delivered", brokerId: "broker-freightline", customerId: "customer-midwest-parts", driverId: "lovepreet-kaur", truckId: "truck-104", origin: { city: "Birmingham", state: "AL", hour: 8 }, dest: { city: "Mobile", state: "AL" }, pickup: "2026-07-01", delivery: "2026-07-02", rate: 590, miles: 258, compliance: "clear", docs: ["doc-ratecon-24020", "doc-bol-24020", "doc-pod-24020"] },
];

function toLoad(entry: LaneSeed): Load {
  const pickupIso = `${entry.pickup}T${String(entry.origin.hour).padStart(2, "0")}:00:00Z`;
  const now = "2026-07-05T12:00:00Z";

  return {
    tenantId: DEMO_TENANT_ID,
    id: entry.id,
    reference: entry.ref,
    status: entry.status,
    customerId: entry.customerId,
    brokerId: entry.brokerId,
    driverId: entry.driverId,
    truckId: entry.truckId,
    origin: {
      city: entry.origin.city,
      state: entry.origin.state,
      scheduledAt: pickupIso,
    },
    destination: {
      city: entry.dest.city,
      state: entry.dest.state,
    },
    pickupDate: entry.pickup,
    deliveryDate: entry.delivery,
    rate: entry.rate,
    miles: entry.miles,
    documentIds: entry.docs,
    invoiceId: entry.invoiceId,
    trackingToken: `trk_${entry.id}`,
    trackingEnabled: Boolean(entry.driverId),
    complianceStatus: entry.compliance,
    novaSummary: "Nova monitoring load status, documents, and driver updates.",
    timeline: [
      {
        id: `evt-${entry.id}-1`,
        loadId: entry.id,
        status: "created",
        label: "Load created",
        occurredAt: now,
        location: `${entry.origin.city}, ${entry.origin.state}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export const dispatchBoardSeedLoads: Load[] = lanes.map(toLoad);
