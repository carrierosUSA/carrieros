import { getCustomerById } from "@/lib/data/customers";
import { getBrokerById } from "@/lib/data/brokers";
import type { Broker, Load } from "@/lib/types";
import { BROKER_PAYMENT_METHOD_LABELS } from "@/lib/types";

export type StopDetail = {
  companyName: string;
  address: string;
  contactName: string;
  phone: string;
  email: string;
  dateTime: string;
  appointment: "APT" | "FCFS";
  appointmentNote?: string;
};

export function formatStopAppointment(detail: StopDetail): string {
  return `${detail.dateTime} · ${detail.appointment}`;
}

export type BrokerDetail = {
  company: string;
  dispatcherName: string;
  phone: string;
  email: string;
  mcNumber: string;
  dotNumber: string;
};

const CONTACT_NAMES = [
  "John Martinez",
  "Sarah Chen",
  "Mike Torres",
  "Lisa Nguyen",
  "David Brooks",
  "Emily Walsh",
];

const STREET_TEMPLATES = [
  (city: string, state: string) => `1200 Industrial Blvd, ${city}, ${state} 78201`,
  (city: string, state: string) =>
    `8800 Commerce Park Drive, Building C, Suite 400, ${city}, ${state} 77002`,
  (city: string, state: string) => `455 Logistics Way, ${city}, ${state} 60601`,
  (city: string, state: string) => `210 Freight Row, Dock 12, ${city}, ${state} 75201`,
];

function hashIndex(seed: string, size: number): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % size;
  }

  return hash;
}

function formatPhone(areaCode: string, suffix: number): string {
  return `(${areaCode}) 555-${String(suffix).padStart(4, "0")}`;
}

function areaCodeForState(state: string): string {
  const codes: Record<string, string> = {
    TX: "210",
    CA: "213",
    AZ: "602",
    IL: "312",
    MI: "313",
    CO: "303",
    UT: "801",
    MO: "816",
    NE: "402",
    LA: "504",
    AR: "501",
    OK: "405",
    TN: "615",
    KY: "502",
    IN: "317",
    OH: "614",
    FL: "305",
    AL: "205",
    GA: "404",
  };

  return codes[state] ?? "800";
}

function formatStopDateTime(date: string, scheduledAt?: string): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));

  if (!scheduledAt) {
    return dateLabel;
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(scheduledAt));

  return `${dateLabel} · ${timeLabel}`;
}

function formatAppointment(scheduledAt?: string): Pick<StopDetail, "appointment" | "appointmentNote"> {
  if (!scheduledAt) {
    return { appointment: "FCFS" };
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(scheduledAt));

  return { appointment: "APT", appointmentNote: timeLabel };
}

function deliveryCompanyName(load: Load, customerName: string): string {
  const customer = getCustomerById(load.customerId);

  if (customer?.type === "consignee" || customer?.type === "both") {
    return customerName;
  }

  return `${load.destination.city} Receiving Center`;
}

function stopEmail(companyName: string, seed: string): string {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);
  const suffix = hashIndex(seed, 99);

  return `dispatch${suffix}@${slug || "facility"}.com`;
}

export function getPickupDetail(load: Load, customerName: string): StopDetail {
  const seed = `${load.id}-pickup`;
  const street = STREET_TEMPLATES[hashIndex(seed, STREET_TEMPLATES.length)](
    load.origin.city,
    load.origin.state,
  );
  const appointment = formatAppointment(load.origin.scheduledAt);

  return {
    companyName: customerName,
    address: street,
    contactName: CONTACT_NAMES[hashIndex(seed, CONTACT_NAMES.length)],
    phone: formatPhone(
      areaCodeForState(load.origin.state),
      1000 + hashIndex(`${seed}-phone`, 8999),
    ),
    email: stopEmail(customerName, seed),
    dateTime: formatStopDateTime(load.pickupDate, load.origin.scheduledAt),
    ...appointment,
  };
}

export function getDeliveryDetail(load: Load, customerName: string): StopDetail {
  const seed = `${load.id}-delivery`;
  const street = STREET_TEMPLATES[hashIndex(seed, STREET_TEMPLATES.length)](
    load.destination.city,
    load.destination.state,
  );
  const appointment = formatAppointment(load.destination.scheduledAt);

  return {
    companyName: deliveryCompanyName(load, customerName),
    address: street,
    contactName: CONTACT_NAMES[hashIndex(seed, CONTACT_NAMES.length)],
    phone: formatPhone(
      areaCodeForState(load.destination.state),
      1000 + hashIndex(`${seed}-phone`, 8999),
    ),
    email: stopEmail(deliveryCompanyName(load, customerName), seed),
    dateTime: formatStopDateTime(load.deliveryDate, load.destination.scheduledAt),
    ...appointment,
  };
}

export function getBrokerDetail(broker?: Broker, brokerEmail?: string): BrokerDetail {
  if (!broker) {
    return {
      company: "Direct Customer",
      dispatcherName: "—",
      phone: "—",
      email: brokerEmail ?? "—",
      mcNumber: "—",
      dotNumber: "—",
    };
  }

  const dispatcher = broker.contacts?.find((contact) => contact.role === "dispatcher");

  return {
    company: broker.name,
    dispatcherName: dispatcher?.name ?? "—",
    phone: broker.phone ?? dispatcher?.phone ?? "—",
    email: brokerEmail ?? broker.email ?? dispatcher?.email ?? "—",
    mcNumber: broker.mcNumber ?? "—",
    dotNumber: broker.dotNumber ?? "—",
  };
}

export function getBrokerCreditStatus(brokerId?: string): string {
  if (!brokerId) {
    return "Direct · No broker hold";
  }

  const broker = getBrokerById(brokerId);

  if (!broker) {
    return "Approved · Net 30";
  }

  if (broker.status === "credit_hold") {
    return `Credit hold · ${broker.paymentTerms}`;
  }

  if (broker.paymentMethod === "quick_pay") {
    return `Approved · ${BROKER_PAYMENT_METHOD_LABELS.quick_pay}`;
  }

  if (broker.paymentMethod === "factoring") {
    return `Approved · ${BROKER_PAYMENT_METHOD_LABELS.factoring}`;
  }

  return `Approved · ${broker.paymentTerms}`;
}

export function getDriverCheckCallMock(loadId: string): string {
  const minutes = 18 + hashIndex(`${loadId}-check-call`, 90);
  return `${minutes} min ago`;
}

export function getDriverHoursRemainingMock(loadId: string): string {
  const tenths = 4 + hashIndex(`${loadId}-hos`, 16);
  return `${(tenths / 2).toFixed(1)} hrs`;
}

export function phoneHref(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, "");

  if (!digits || digits === "—") {
    return undefined;
  }

  return `tel:${digits}`;
}

export function emailHref(email: string): string | undefined {
  if (!email || email === "—") {
    return undefined;
  }

  return `mailto:${email}`;
}
