import { buildDriverMobileState } from "@/lib/driver-mobile/seed";
import { DRIVER_BRAND } from "@/lib/driver-app/constants";
import type {
  ConnectedService,
  DriverAppDocument,
  DriverAppExpense,
  DriverAppState,
  DriverAppTrip,
  DriverSettlement,
  DriverTripStatus,
  FuelTransaction,
  MaintenanceIssue,
  SafetyAlert,
} from "@/lib/driver-app/types";

function enrichTrip(load: DriverAppTrip): DriverAppTrip {
  const isActive = ["dispatched", "picked_up", "in_transit", "accepted", "loaded"].includes(
    load.status,
  );
  return {
    ...load,
    remainingMiles: isActive ? Math.max(40, Math.round(load.miles * 0.35)) : load.miles,
    appointmentWindow: load.deliveryAt
      ? new Date(load.deliveryAt).toLocaleString(undefined, {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      : "FCFS after 2 PM",
    brokerNotes: load.notes ?? "Call ahead 30 min. Yard entrance on north side.",
    dispatcherNotes: load.instructions ?? "Confirm ETA with broker if delayed >30 min.",
    tempReq: load.commodity?.toLowerCase().includes("reefer") ? "34°F" : undefined,
    sealNumber: isActive ? "SL-88421" : undefined,
    references: [load.reference, `PO-${load.id.slice(-4).toUpperCase()}`],
    trailerUnit: "TRL-441",
    stops: [
      {
        label: "Pickup",
        city: load.originCity,
        state: load.originState,
        type: "pickup",
      },
      {
        label: "Delivery",
        city: load.destCity,
        state: load.destState,
        type: "delivery",
      },
    ],
    timeline: [
      { id: "t1", label: "Accepted", at: undefined, done: !load.offered },
      { id: "t2", label: "Arrived pickup", done: ["picked_up", "in_transit", "loaded", "completed", "delivered"].includes(load.status) },
      { id: "t3", label: "Loaded / departed", done: ["in_transit", "completed", "delivered"].includes(load.status) },
      { id: "t4", label: "Arrived delivery", done: ["completed", "delivered"].includes(load.status) },
      { id: "t5", label: "Delivered + POD", done: ["completed", "delivered"].includes(load.status) },
    ],
  };
}

function inferTripStatus(state: ReturnType<typeof buildDriverMobileState>): DriverTripStatus {
  const load = state.loads.find((l) => l.id === state.todaysLoadId) ?? state.loads[0];
  if (!load) return "available";
  if (load.detentionActive) return "detention_start";
  switch (load.status) {
    case "offered":
      return "available";
    case "accepted":
    case "dispatched":
      return "heading_to_pickup";
    case "checked_in":
      return "arrived_pickup";
    case "loaded":
    case "picked_up":
      return "loaded";
    case "in_transit":
      return "departed";
    case "completed":
    case "delivered":
      return "delivered";
    case "empty":
      return "empty";
    default:
      return "heading_to_pickup";
  }
}

function seedFuel(): FuelTransaction[] {
  const now = Date.now();
  return [
    {
      id: "fuel-1",
      providerId: "loves",
      providerName: "Love's",
      truckUnit: "Unit 102",
      driverName: "Onkar Singh",
      stationName: "Love's Travel Stop #412",
      stationCity: "Denton",
      stationState: "TX",
      gallons: 98.2,
      defGallons: 4.1,
      pricePerGallon: 3.59,
      amount: 368.42,
      cardLast4: "4412",
      txnId: "LV-99218401",
      purchasedAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
      source: "provider_sync",
    },
    {
      id: "fuel-2",
      providerId: "pilot",
      providerName: "Pilot",
      truckUnit: "Unit 102",
      driverName: "Onkar Singh",
      stationName: "Pilot Travel Center #289",
      stationCity: "Oklahoma City",
      stationState: "OK",
      gallons: 72.5,
      pricePerGallon: 3.71,
      amount: 268.98,
      cardLast4: "4412",
      txnId: "PT-55102933",
      purchasedAt: new Date(now - 1000 * 60 * 60 * 40).toISOString(),
      unusual: true,
      unusualReason: "Price $0.22 above 7-day corridor average",
      source: "provider_sync",
    },
    {
      id: "fuel-3",
      providerId: "comdata",
      providerName: "Comdata",
      truckUnit: "Unit 102",
      driverName: "Onkar Singh",
      stationName: "TA Petro #118",
      stationCity: "Dallas",
      stationState: "TX",
      gallons: 110.0,
      defGallons: 5.0,
      pricePerGallon: 3.52,
      amount: 402.10,
      cardLast4: "8810",
      txnId: "CD-77412009",
      purchasedAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      source: "provider_sync",
    },
  ];
}

function seedConnections(): ConnectedService[] {
  const sync = new Date(Date.now() - 1000 * 60 * 12).toISOString();
  return [
    { id: "c-fuel", category: "fuel", name: "Comdata + Love's", provider: "Comdata", connected: true, lastSyncAt: sync, statusNote: "Demo sync — not live API" },
    { id: "c-eld", category: "eld", name: "Samsara ELD", provider: "Samsara", connected: true, lastSyncAt: sync },
    { id: "c-gps", category: "gps", name: "Fleet GPS", provider: "Samsara", connected: true, lastSyncAt: sync },
    { id: "c-telematics", category: "telematics", name: "Engine telematics", provider: "Samsara", connected: true, lastSyncAt: sync },
    { id: "c-insurance", category: "insurance", name: "Cargo & liability", provider: "Great West", connected: true, lastSyncAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "c-maint", category: "maintenance", name: "Shop work orders", provider: "CarrierOS Shop", connected: true, lastSyncAt: sync },
    { id: "c-banks", category: "banks", name: "Driver pay card", provider: "WEX Bank", connected: false, statusNote: "Connect to view advances" },
    { id: "c-payroll", category: "payroll", name: "Settlements", provider: "CarrierOS Payroll", connected: true, lastSyncAt: sync },
    { id: "c-acct", category: "accounting", name: "QuickBooks link", provider: "Intuit", connected: false },
    { id: "c-factor", category: "factoring", name: "Factoring portal", provider: "RTS Financial", connected: false },
    { id: "c-boards", category: "load_boards", name: "DAT / Truckstop", provider: "DAT", connected: false },
    { id: "c-tolls", category: "tolls", name: "PrePass / tolls", provider: "PrePass", connected: true, lastSyncAt: sync },
    { id: "c-park", category: "parking", name: "Truck parking", provider: "Trucker Path", connected: false },
    { id: "c-oem", category: "oem", name: "OEM diagnostics", provider: "Freightliner", connected: false },
  ];
}

function seedMaintenance(): MaintenanceIssue[] {
  return [
    {
      id: "mi-1",
      unit: "Unit 102",
      severity: "medium",
      title: "ABS light intermittent",
      description: "Light flickers after hard brake on wet roads.",
      aiPossibleIssue: "AI: possible wheel speed sensor or connector corrosion.",
      status: "acknowledged",
      reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
  ];
}

function seedSafety(): SafetyAlert[] {
  return [
    {
      id: "sa-1",
      title: "Thunderstorms near OKC",
      body: "Severe weather possible after 5 PM. Reduce speed; allow extra ETA buffer.",
      kind: "weather",
      severity: "warning",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
    {
      id: "sa-2",
      title: "I-35 construction",
      body: "Lane closures southbound near Edmond — expect 15–25 min delay.",
      kind: "road",
      severity: "info",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ];
}

export function buildDriverAppState(driverId?: string): DriverAppState {
  const base = buildDriverMobileState(driverId);
  const loads = base.loads.map((l) => enrichTrip(l));
  const tripStatus = inferTripStatus(base);

  const documents: DriverAppDocument[] = base.documents.map((d) => ({
    ...d,
    kind: (d.type === "pod"
      ? "pod"
      : d.type === "bol"
        ? "bol"
        : d.type === "fuel"
          ? "fuel"
          : "other") as DriverAppDocument["kind"],
    categoryLabel: d.type.toUpperCase(),
  }));

  const expenses: DriverAppExpense[] = [
    {
      id: "exp-seed-1",
      category: "parking",
      amount: 25,
      note: "Overnight secure lot",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      status: "submitted",
      flag: "reimbursable",
      approvalStatus: "pending_approval",
      aiCategory: "Parking",
      aiSummary: "AI: overnight parking — pending manager approval.",
    },
  ];

  const payroll: DriverSettlement[] = base.payroll.map((p, i) => ({
    ...p,
    approvalStatus:
      p.status === "paid"
        ? ("paid" as const)
        : i === 0
          ? ("pending_manager" as const)
          : ("approved" as const),
    loadedMiles: 1840,
    emptyMiles: 210,
    stopPay: 75,
    detentionPay: 120,
    layoverPay: 0,
    bonuses: Math.round(p.grossPay * 0.08),
    reimbursements: Math.round(p.grossPay * 0.05),
    advances: 200,
    deductions: Math.abs(p.lines.find((l) => l.kind === "deduction")?.amount ?? 0),
    perDiem: 68,
    managerNote:
      p.status === "paid" ? undefined : "Manager approval required before payment.",
  }));

  return {
    ...base,
    loads,
    documents,
    expenses,
    payroll,
    brand: DRIVER_BRAND,
    tripStatus,
    fuelLevelPct: 62,
    remainingMiles: loads.find((l) => l.id === base.todaysLoadId)?.remainingMiles ?? 180,
    appointmentWindow:
      loads.find((l) => l.id === base.todaysLoadId)?.appointmentWindow ?? "FCFS after 2 PM",
    weather: {
      label: "Oklahoma City",
      tempF: 84,
      condition: "Partly cloudy",
      windMph: 12,
    },
    traffic: {
      label: "I-35 N",
      delayMinutes: 18,
      severity: "moderate",
    },
    fuelTransactions: seedFuel(),
    connections: seedConnections(),
    maintenanceIssues: seedMaintenance(),
    safetyAlerts: seedSafety(),
    security: {
      faceIdEnabled: true,
      fingerprintEnabled: false,
      pinEnabled: false,
      pinSet: false,
      encryptedAtRest: true,
    },
    mpgAverage: 6.4,
    lastToast: null,
    tasks: base.tasks.map((t) => ({
      ...t,
      href:
        t.href === "?tab=documents"
          ? "/driver/documents"
          : t.href === "?tab=documents&view=dvir"
            ? "/driver/dvir"
            : t.href === "?tab=messages"
              ? "/driver/messages"
              : t.href,
    })),
  };
}
