import { seedDrivers, seedDriverDocuments, seedDriverPayroll } from "@/lib/data/driver-store";
import { loads } from "@/lib/data/loads";
import { dispatchBoardSeedLoads } from "@/lib/dispatch/demo-loads";
import type {
  DriverMobileLoad,
  DriverMobileState,
  DriverMessageThread,
} from "@/lib/driver-mobile/types";
import { orderedPickupNumbers } from "@/lib/loads/pickup-numbers";
import type { PickupNumber } from "@/lib/types/pickup-number";

export const DEMO_DRIVER_ID = "onkar-singh";
export const DISPATCH_PHONE = "210-555-0100";

const BROKER_NAMES: Record<string, { name: string; phone: string }> = {
  "broker-capital": { name: "Capital Freight", phone: "214-555-0288" },
  "broker-freightline": { name: "Freightline Logistics", phone: "713-555-0144" },
};

function brokerFor(brokerId?: string) {
  if (!brokerId) return { name: "Broker", phone: "210-555-0199" };
  return BROKER_NAMES[brokerId] ?? { name: "Broker", phone: "210-555-0199" };
}

function toMobileLoad(
  load: {
    id: string;
    reference: string;
    status: string;
    origin: { city: string; state: string; scheduledAt?: string; address?: string };
    destination: { city: string; state: string; scheduledAt?: string; address?: string };
    pickupDate: string;
    deliveryDate: string;
    rate: number;
    miles: number;
    brokerId?: string;
    commodity?: string;
    weight?: number;
    notes?: string;
    novaSummary?: string;
    complianceStatus?: string;
    pickupNumbers?: PickupNumber[];
  },
  opts?: { offered?: boolean; missingDocs?: string[] },
): DriverMobileLoad {
  const broker = brokerFor(load.brokerId);
  const isActive = ["dispatched", "picked_up", "in_transit"].includes(load.status);
  const nextStopLabel = isActive
    ? `Delivery · ${load.destination.city}, ${load.destination.state}`
    : `Pickup · ${load.origin.city}, ${load.origin.state}`;

  return {
    id: load.id,
    reference: load.reference,
    status: (opts?.offered ? "offered" : load.status) as DriverMobileLoad["status"],
    originCity: load.origin.city,
    originState: load.origin.state,
    originAddress: load.origin.address ?? `${load.origin.city}, ${load.origin.state}`,
    destCity: load.destination.city,
    destState: load.destination.state,
    destAddress:
      load.destination.address ?? `${load.destination.city}, ${load.destination.state}`,
    pickupDate: load.pickupDate,
    deliveryDate: load.deliveryDate,
    pickupAt: load.origin.scheduledAt,
    deliveryAt: load.destination.scheduledAt,
    rate: load.rate,
    miles: load.miles,
    commodity: load.commodity,
    weight: load.weight,
    brokerName: broker.name,
    brokerPhone: broker.phone,
    dispatchPhone: DISPATCH_PHONE,
    notes: load.notes,
    instructions: load.novaSummary,
    nextStopLabel,
    eta: isActive ? "2h 15m" : "Tomorrow 9:00 AM",
    detentionActive: false,
    missingDocs:
      opts?.missingDocs ??
      (load.complianceStatus === "attention" ? ["POD"] : []),
    offered: opts?.offered,
    pickupNumbers: orderedPickupNumbers(load.pickupNumbers),
  };
}

function buildDriverLoads(driverId: string): DriverMobileLoad[] {
  const fromCore = loads.filter((l) => l.driverId === driverId);
  const fromDemo = dispatchBoardSeedLoads.filter((l) => l.driverId === driverId);
  const byId = new Map<string, DriverMobileLoad>();

  for (const load of [...fromCore, ...fromDemo]) {
    byId.set(load.id, toMobileLoad(load));
  }

  // Offer an unassigned pending load so Accept/Reject is demoable
  const offer = [...loads, ...dispatchBoardSeedLoads].find(
    (l) => !l.driverId && l.status === "pending",
  );
  if (offer) {
    byId.set(
      offer.id,
      toMobileLoad(offer, {
        offered: true,
        missingDocs: ["Rate Con"],
      }),
    );
  }

  return Array.from(byId.values()).sort((a, b) => {
    const rank = (s: string) => {
      if (s === "offered") return 0;
      if (s === "in_transit" || s === "picked_up") return 1;
      if (s === "dispatched") return 2;
      if (s === "delivered" || s === "invoiced") return 4;
      return 3;
    };
    return rank(a.status) - rank(b.status);
  });
}

function buildThreads(): DriverMessageThread[] {
  const now = Date.now();
  return [
    {
      channel: "dispatch",
      title: "Dispatch",
      subtitle: "Lovepreet Kaur",
      unread: 1,
      messages: [
        {
          id: "msg-d1",
          channel: "dispatch",
          sender: "team",
          senderName: "Lovepreet",
          body: "Confirm ETA to OKC for LD-24003. Broker asking.",
          sentAt: new Date(now - 1000 * 60 * 42).toISOString(),
        },
        {
          id: "msg-d2",
          channel: "dispatch",
          sender: "driver",
          senderName: "You",
          body: "On schedule — about 2 hours out.",
          sentAt: new Date(now - 1000 * 60 * 38).toISOString(),
        },
        {
          id: "msg-d3",
          channel: "dispatch",
          sender: "team",
          senderName: "Lovepreet",
          body: "Thanks. Call if detention starts.",
          sentAt: new Date(now - 1000 * 60 * 12).toISOString(),
        },
      ],
    },
    {
      channel: "office",
      title: "Office",
      subtitle: "Operations desk",
      unread: 0,
      messages: [
        {
          id: "msg-o1",
          channel: "office",
          sender: "team",
          senderName: "Office",
          body: "Updated emergency contacts are on file. Call if you need a hotel voucher.",
          sentAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
        },
      ],
    },
    {
      channel: "accounting",
      title: "Accounting",
      subtitle: "Settlements & pay",
      unread: 0,
      messages: [
        {
          id: "msg-a1",
          channel: "accounting",
          sender: "team",
          senderName: "Accounting",
          body: "Upload POD to release invoice. Advances show on next settlement.",
          sentAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
        },
      ],
    },
    {
      channel: "maintenance",
      title: "Maintenance",
      subtitle: "Shop",
      unread: 0,
      messages: [
        {
          id: "msg-m1",
          channel: "maintenance",
          sender: "team",
          senderName: "Shop",
          body: "Unit 102 oil change due in 800 miles.",
          sentAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        },
      ],
    },
    {
      channel: "safety",
      title: "Safety",
      subtitle: "Safety team",
      unread: 0,
      messages: [
        {
          id: "msg-s1",
          channel: "safety",
          sender: "team",
          senderName: "Safety",
          body: "Reminder: complete post-trip DVIR after delivery.",
          sentAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        },
      ],
    },
    {
      channel: "payroll",
      title: "Payroll",
      subtitle: "Settlements",
      unread: 0,
      messages: [
        {
          id: "msg-p1",
          channel: "payroll",
          sender: "team",
          senderName: "Payroll",
          body: "June settlement is paid. July period closes Friday.",
          sentAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        },
      ],
    },
    {
      channel: "group",
      title: "Group",
      subtitle: "Fleet drivers",
      unread: 0,
      messages: [
        {
          id: "msg-g1",
          channel: "group",
          sender: "team",
          senderName: "Fleet",
          body: "Storms north of OKC tonight — leave early if you can.",
          sentAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        },
      ],
    },
  ];
}

export function buildDriverMobileState(driverId = DEMO_DRIVER_ID): DriverMobileState {
  const driver = seedDrivers.find((d) => d.id === driverId) ?? seedDrivers[0];
  const mobileLoads = buildDriverLoads(driver.id);
  const todaysLoad =
    mobileLoads.find((l) =>
      ["in_transit", "picked_up", "dispatched"].includes(l.status),
    ) ?? mobileLoads[0];

  const payrollSeed = seedDriverPayroll.filter((p) => p.driverId === driver.id);
  const profileDocs = seedDriverDocuments
    .filter((d) => d.driverId === driver.id)
    .map((d) => ({
      name: d.name,
      status: d.status,
      expiresAt: d.expiresAt,
    }));

  return {
    driverId: driver.id,
    driverName: driver.name,
    photoUrl: driver.photoUrl,
    phone: driver.phone,
    truckUnit: driver.truckId?.replace("truck-", "Unit ") ?? "Unassigned",
    cdl: {
      class: driver.licenseClass,
      number: driver.licenseNumber,
      state: driver.licenseState,
      expiresAt: driver.licenseExpiresAt,
    },
    medical: {
      expiresAt: driver.medicalExpiresAt,
      cardNumber: `MC-${driver.id.toUpperCase()}`,
    },
    training: ["Hazmat awareness", "Defensive driving", "ELD & HOS"],
    profileDocs,
    currentStatus:
      todaysLoad?.status === "in_transit"
        ? "In transit"
        : todaysLoad?.status === "dispatched"
          ? "En route to pickup"
          : "Available",
    todaysLoadId: todaysLoad?.id,
    loads: mobileLoads,
    tasks: [
      {
        id: "task-pod",
        title: "Upload POD",
        detail: todaysLoad
          ? `${todaysLoad.reference} — photo or PDF`
          : "When delivery completes",
        urgency: "warning",
        href: "?tab=documents",
      },
      {
        id: "task-dvir",
        title: "Pre-trip inspection",
        detail: "Required before next departure",
        urgency: "info",
        href: "?tab=documents&view=dvir",
      },
      {
        id: "task-eta",
        title: "Confirm ETA with dispatch",
        detail: "Broker requested update",
        urgency: "critical",
        href: "?tab=messages",
      },
    ],
    alerts: [
      {
        id: "alert-1",
        title: "Appointment window updated",
        body: `${todaysLoad?.reference ?? "Load"} delivery moved to 4–6 PM.`,
        kind: "appointment_change",
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        read: false,
      },
      {
        id: "alert-2",
        title: "Document requested",
        body: "Dispatch needs BOL photo for settlement.",
        kind: "document_request",
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        read: false,
      },
      {
        id: "alert-3",
        title: "Payroll update",
        body: "June settlement paid — $5,920 net.",
        kind: "payroll_update",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        read: true,
      },
      {
        id: "alert-4",
        title: "New load offer",
        body: "LD-24001 Dallas → Phoenix available to accept.",
        kind: "new_load",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
      },
    ],
    threads: buildThreads(),
    expenses: [],
    documents: [],
    dvirs: [],
    payroll: payrollSeed.map((p) => ({
      id: p.id,
      period: p.period,
      grossPay: p.grossPay,
      netPay: p.netPay,
      status: p.status === "paid" ? ("paid" as const) : ("pending" as const),
      lines: [
        {
          id: `${p.id}-cpm`,
          label: "Linehaul (CPM)",
          amount: Math.round(p.grossPay * 0.78),
          kind: "cpm" as const,
        },
        {
          id: `${p.id}-bonus`,
          label: "On-time bonus",
          amount: Math.round(p.grossPay * 0.08),
          kind: "bonus" as const,
        },
        {
          id: `${p.id}-det`,
          label: "Detention",
          amount: Math.round(p.grossPay * 0.06),
          kind: "detention" as const,
        },
        {
          id: `${p.id}-reimb`,
          label: "Reimbursements",
          amount: Math.round(p.grossPay * 0.08),
          kind: "reimbursement" as const,
        },
        {
          id: `${p.id}-ded`,
          label: "Deductions",
          amount: -p.deductions,
          kind: "deduction" as const,
        },
      ],
    })),
    hos: {
      driveRemainingHours: driver.hoursRemaining ?? 6.5,
      onDutyRemainingHours: Math.min(11, (driver.hoursRemaining ?? 6.5) + 2),
      cycleRemainingHours: 42,
      status:
        (driver.hoursRemaining ?? 6.5) < 3
          ? "critical"
          : (driver.hoursRemaining ?? 6.5) < 5
            ? "warning"
            : "available",
      nextBreakDue: "In 2h 40m",
    },
    weekEarnings: 1840,
    location: {
      lat: 35.4676,
      lng: -97.5164,
      speedMph: 62,
      headingDeg: 18,
      eta: todaysLoad?.eta ?? "—",
      accuracyM: 12,
      sharing: true,
      updatedAt: new Date().toISOString(),
      geofenceEvents: [
        {
          id: "geo-1",
          type: "exited",
          label: "Austin pickup yard",
          occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        },
        {
          id: "geo-2",
          type: "entered",
          label: "I-35 corridor",
          occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
      ],
    },
    offlineQueue: [],
    alphSuggestions: [
      {
        id: "alph-1",
        title: "Missing POD reminder",
        body: "Upload proof of delivery after you complete the stop — settlement waits on it.",
        tone: "warning",
      },
      {
        id: "alph-2",
        title: "Appointment window",
        body: "Delivery is FCFS after 2 PM. Arrive early to avoid detention.",
        tone: "info",
      },
      {
        id: "alph-3",
        title: "Fuel stop nearby",
        body: "Love’s Travel Stop 12 miles ahead — diesel ~$0.08 under average.",
        tone: "success",
      },
    ],
  };
}
