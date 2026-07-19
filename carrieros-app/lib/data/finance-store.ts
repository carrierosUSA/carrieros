import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import { loads as seedLoads } from "@/lib/data/loads";
import { dispatchBoardSeedLoads } from "@/lib/dispatch/demo-loads";
import { getBrokerById } from "@/lib/data/brokers";
import { driverStore } from "@/lib/data/driver-store";
import { truckStore } from "@/lib/data/fleet-store";
import type {
  BrokerPaymentRecord,
  DriverPayrollSettlement,
  ExpenseRecord,
  FactoringAccount,
  FinanceInvoice,
  OwnerSettlement,
  RevenueRecord,
  RevenueStatus,
} from "@/lib/types/finance";
import type { Load } from "@/lib/types";

const ALL_LOADS: Load[] = [...seedLoads, ...dispatchBoardSeedLoads];

function driverName(id?: string): string | undefined {
  if (!id) return undefined;
  return driverStore.find((d) => d.id === id)?.name;
}

function truckUnit(id?: string): string | undefined {
  if (!id) return undefined;
  return truckStore.find((t) => t.id === id)?.unitNumber;
}

function revenueStatusFromLoad(load: Load, dueDate: string): RevenueStatus {
  if (load.status === "invoiced") {
    const today = "2026-07-17";
    if (dueDate < today && !load.invoiceId?.includes("paid")) {
      return "overdue";
    }
    return "invoiced";
  }
  if (load.status === "delivered") {
    return "pending";
  }
  return "pending";
}

function deriveRevenueFromLoads(tenantId: string): RevenueRecord[] {
  return ALL_LOADS.filter(
    (load) =>
      load.tenantId === tenantId &&
      (load.status === "delivered" || load.status === "invoiced"),
  ).map((load) => {
    const broker = load.brokerId ? getBrokerById(load.brokerId) : undefined;
    const dueDate = addDays(load.deliveryDate, 30);
    let status = revenueStatusFromLoad(load, dueDate);

    // Seed a few paid / overdue for a richer dashboard
    if (load.id === "load-24005") status = "paid";
    if (load.reference.includes("104") || load.id.endsWith("04")) {
      if (status === "invoiced") status = "overdue";
    }

    return {
      tenantId,
      id: `rev-${load.id}`,
      loadId: load.id,
      loadReference: load.reference,
      brokerId: load.brokerId,
      brokerName: broker?.name ?? "Direct customer",
      driverId: load.driverId,
      driverName: driverName(load.driverId),
      truckId: load.truckId,
      truckUnit: truckUnit(load.truckId),
      amount: load.rate,
      miles: load.miles,
      deliveredAt: load.deliveryDate,
      status,
      invoiceId: load.invoiceId,
    };
  });
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const derivedRevenue = deriveRevenueFromLoads(DEMO_TENANT_ID);

/** Extra seeded revenue beyond live loads for richer period stats */
const extraRevenue: RevenueRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "rev-extra-today-1",
    loadId: "load-seed-today-1",
    loadReference: "LD-24110",
    brokerId: "broker-freightline",
    brokerName: "FreightLine Logistics",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    truckId: "truck-102",
    truckUnit: "102",
    amount: 2450,
    miles: 612,
    deliveredAt: "2026-07-17",
    status: "invoiced",
    invoiceId: "inv-fin-001",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "rev-extra-today-2",
    loadId: "load-seed-today-2",
    loadReference: "LD-24111",
    brokerId: "broker-capital",
    brokerName: "Capital Freight Partners",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    truckId: "truck-104",
    truckUnit: "104",
    amount: 1880,
    miles: 428,
    deliveredAt: "2026-07-17",
    status: "pending",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "rev-extra-week-1",
    loadId: "load-seed-week-1",
    loadReference: "LD-24102",
    brokerId: "broker-horizon",
    brokerName: "Horizon Relay Group",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    truckId: "truck-107",
    truckUnit: "107",
    amount: 3200,
    miles: 890,
    deliveredAt: "2026-07-14",
    status: "paid",
    invoiceId: "inv-fin-002",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "rev-extra-week-2",
    loadId: "load-seed-week-2",
    loadReference: "LD-24105",
    brokerId: "broker-summit",
    brokerName: "Summit Lane Brokers",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    truckId: "truck-102",
    truckUnit: "102",
    amount: 980,
    miles: 310,
    deliveredAt: "2026-07-13",
    status: "overdue",
    invoiceId: "inv-fin-003",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "rev-extra-month-1",
    loadId: "load-seed-month-1",
    loadReference: "LD-24088",
    brokerId: "broker-pacific",
    brokerName: "Pacific Corridor Freight",
    driverId: "sarah-johnson",
    driverName: "Sarah Johnson",
    truckId: "truck-110",
    truckUnit: "110",
    amount: 4100,
    miles: 1120,
    deliveredAt: "2026-07-05",
    status: "paid",
    invoiceId: "inv-fin-004",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "rev-extra-low-profit",
    loadId: "load-seed-low",
    loadReference: "LD-24091",
    brokerId: "broker-midwest",
    brokerName: "Midwest Alliance Logistics",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    truckId: "truck-112",
    truckUnit: "112",
    amount: 420,
    miles: 580,
    deliveredAt: "2026-07-08",
    status: "invoiced",
    invoiceId: "inv-fin-005",
  },
];

export let revenueStore: RevenueRecord[] = [...derivedRevenue, ...extraRevenue];

export let expenseStore: ExpenseRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-001",
    category: "fuel",
    description: "Pilot — I-10 San Antonio",
    amount: 685,
    occurredAt: "2026-07-17",
    truckId: "truck-102",
    truckUnit: "102",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    vendor: "Pilot Flying J",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-002",
    category: "fuel",
    description: "Love's — Dallas",
    amount: 720,
    occurredAt: "2026-07-15",
    truckId: "truck-104",
    truckUnit: "104",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    vendor: "Love's",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-003",
    category: "maintenance",
    description: "Oil change + filters — Unit 102",
    amount: 480,
    occurredAt: "2026-07-12",
    truckId: "truck-102",
    truckUnit: "102",
    vendor: "FleetCare SA",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-004",
    category: "tires",
    description: "Steer tire replacement — Unit 107",
    amount: 890,
    occurredAt: "2026-07-10",
    truckId: "truck-107",
    truckUnit: "107",
    vendor: "Goodyear Commercial",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-005",
    category: "toll",
    description: "NTTA tolls — DFW corridor",
    amount: 86,
    occurredAt: "2026-07-14",
    truckId: "truck-104",
    truckUnit: "104",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    receiptOnFile: false,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-006",
    category: "lumper",
    description: "Unload fee — Albuquerque DC",
    amount: 175,
    occurredAt: "2026-06-28",
    loadId: "load-24004",
    loadReference: "LD-24004",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    vendor: "Warehouse Lumper Co",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-007",
    category: "hotel",
    description: "Motel 6 — overnight rest",
    amount: 92,
    occurredAt: "2026-07-11",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    vendor: "Motel 6",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-008",
    category: "insurance",
    description: "Monthly cargo policy installment",
    amount: 2450,
    occurredAt: "2026-07-01",
    vendor: "Progressive Commercial",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-009",
    category: "repairs",
    description: "ABS sensor — Unit 110",
    amount: 340,
    occurredAt: "2026-07-06",
    truckId: "truck-110",
    truckUnit: "110",
    vendor: "Freightliner SA",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-010",
    category: "scale",
    description: "CAT scale — El Paso",
    amount: 18,
    occurredAt: "2026-07-09",
    truckId: "truck-112",
    truckUnit: "112",
    receiptOnFile: false,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-011",
    category: "office",
    description: "Office supplies & postage",
    amount: 128,
    occurredAt: "2026-07-03",
    vendor: "Staples",
    receiptOnFile: true,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-012",
    category: "parking",
    description: "Truck stop overnight — TA",
    amount: 25,
    occurredAt: "2026-07-16",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    receiptOnFile: false,
  },
  // Duplicate-looking expense for Alph
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-013",
    category: "fuel",
    description: "Pilot — I-10 San Antonio",
    amount: 685,
    occurredAt: "2026-07-17",
    truckId: "truck-102",
    truckUnit: "102",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    vendor: "Pilot Flying J",
    receiptOnFile: false,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "exp-014",
    category: "other",
    description: "Unusual roadside tow — Unit 112",
    amount: 1850,
    occurredAt: "2026-07-08",
    truckId: "truck-112",
    truckUnit: "112",
    vendor: "Roadside Assist TX",
    receiptOnFile: true,
  },
];

export let invoiceStore: FinanceInvoice[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-001",
    invoiceNumber: "INV-24110",
    loadId: "load-seed-today-1",
    loadReference: "LD-24110",
    brokerId: "broker-freightline",
    brokerName: "FreightLine Logistics",
    amount: 2450,
    amountPaid: 0,
    status: "sent",
    issuedAt: "2026-07-17",
    dueDate: "2026-08-16",
    emailedAt: "2026-07-17",
    pdfName: "INV-24110.pdf",
    reminders: [],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-002",
    invoiceNumber: "INV-24102",
    loadId: "load-seed-week-1",
    loadReference: "LD-24102",
    brokerId: "broker-horizon",
    brokerName: "Horizon Relay Group",
    amount: 3200,
    amountPaid: 3200,
    status: "paid",
    issuedAt: "2026-07-14",
    dueDate: "2026-08-13",
    paidAt: "2026-07-16",
    emailedAt: "2026-07-14",
    pdfName: "INV-24102.pdf",
    reminders: [],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-003",
    invoiceNumber: "INV-24105",
    loadId: "load-seed-week-2",
    loadReference: "LD-24105",
    brokerId: "broker-summit",
    brokerName: "Summit Lane Brokers",
    amount: 980,
    amountPaid: 0,
    status: "overdue",
    issuedAt: "2026-06-13",
    dueDate: "2026-07-13",
    emailedAt: "2026-06-13",
    pdfName: "INV-24105.pdf",
    reminders: [
      {
        id: "rem-001",
        sentAt: "2026-07-14",
        channel: "email",
        note: "First overdue reminder",
      },
      {
        id: "rem-002",
        sentAt: "2026-07-16",
        channel: "email",
        note: "Second reminder — accounting follow-up",
      },
    ],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-004",
    invoiceNumber: "INV-24088",
    loadId: "load-seed-month-1",
    loadReference: "LD-24088",
    brokerId: "broker-pacific",
    brokerName: "Pacific Corridor Freight",
    amount: 4100,
    amountPaid: 4100,
    status: "paid",
    issuedAt: "2026-07-05",
    dueDate: "2026-08-04",
    paidAt: "2026-07-10",
    emailedAt: "2026-07-05",
    pdfName: "INV-24088.pdf",
    reminders: [],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-005",
    invoiceNumber: "INV-24091",
    loadId: "load-seed-low",
    loadReference: "LD-24091",
    brokerId: "broker-midwest",
    brokerName: "Midwest Alliance Logistics",
    amount: 420,
    amountPaid: 0,
    status: "sent",
    issuedAt: "2026-07-08",
    dueDate: "2026-08-07",
    emailedAt: "2026-07-08",
    pdfName: "INV-24091.pdf",
    reminders: [],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-006",
    invoiceNumber: "INV-24005",
    loadId: "load-24005",
    loadReference: "LD-24005",
    brokerId: "broker-capital",
    brokerName: "Capital Freight Partners",
    amount: 620,
    amountPaid: 620,
    status: "paid",
    issuedAt: "2026-06-21",
    dueDate: "2026-07-21",
    paidAt: "2026-07-02",
    emailedAt: "2026-06-21",
    pdfName: "INV-24005.pdf",
    reminders: [],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "inv-fin-007",
    invoiceNumber: "INV-DRAFT-24004",
    loadId: "load-24004",
    loadReference: "LD-24004",
    brokerId: "broker-freightline",
    brokerName: "FreightLine Logistics",
    amount: 780,
    amountPaid: 0,
    status: "draft",
    issuedAt: "2026-07-16",
    dueDate: "2026-08-15",
    reminders: [],
    notes: "Waiting on final packet review",
  },
];

export let brokerPaymentStore: BrokerPaymentRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "bp-001",
    brokerId: "broker-freightline",
    brokerName: "FreightLine Logistics",
    invoiceId: "inv-fin-001",
    invoiceNumber: "INV-24110",
    invoiceAmount: 2450,
    amountReceived: 0,
    dueDate: "2026-08-16",
    status: "outstanding",
    quickPay: true,
    factoring: false,
    lateFees: 0,
    paymentTerms: "Quick Pay · 2%",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "bp-002",
    brokerId: "broker-summit",
    brokerName: "Summit Lane Brokers",
    invoiceId: "inv-fin-003",
    invoiceNumber: "INV-24105",
    invoiceAmount: 980,
    amountReceived: 0,
    dueDate: "2026-07-13",
    status: "overdue",
    quickPay: false,
    factoring: false,
    lateFees: 49,
    paymentTerms: "Net 30",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "bp-003",
    brokerId: "broker-horizon",
    brokerName: "Horizon Relay Group",
    invoiceId: "inv-fin-002",
    invoiceNumber: "INV-24102",
    invoiceAmount: 3200,
    amountReceived: 3200,
    dueDate: "2026-08-13",
    receivedAt: "2026-07-16",
    status: "paid",
    quickPay: false,
    factoring: true,
    lateFees: 0,
    paymentTerms: "Factoring",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "bp-004",
    brokerId: "broker-midwest",
    brokerName: "Midwest Alliance Logistics",
    invoiceId: "inv-fin-005",
    invoiceNumber: "INV-24091",
    invoiceAmount: 420,
    amountReceived: 0,
    dueDate: "2026-08-07",
    status: "outstanding",
    quickPay: false,
    factoring: false,
    lateFees: 0,
    paymentTerms: "Net 45",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "bp-005",
    brokerId: "broker-capital",
    brokerName: "Capital Freight Partners",
    invoiceId: "inv-fin-006",
    invoiceNumber: "INV-24005",
    invoiceAmount: 620,
    amountReceived: 620,
    dueDate: "2026-07-21",
    receivedAt: "2026-07-02",
    status: "paid",
    quickPay: true,
    factoring: false,
    lateFees: 0,
    paymentTerms: "Quick Pay · 2%",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "bp-006",
    brokerId: "broker-pacific",
    brokerName: "Pacific Corridor Freight",
    invoiceId: "inv-fin-004",
    invoiceNumber: "INV-24088",
    invoiceAmount: 4100,
    amountReceived: 4100,
    dueDate: "2026-08-04",
    receivedAt: "2026-07-10",
    status: "factored",
    quickPay: false,
    factoring: true,
    lateFees: 0,
    paymentTerms: "Factoring",
  },
];

export let payrollSettlementStore: DriverPayrollSettlement[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "ps-001",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    period: "Jul 6 – Jul 12, 2026",
    payMethod: "cpm",
    rateLabel: "$0.62 / mi",
    miles: 2180,
    basePay: 1351.6,
    bonus: 150,
    detention: 200,
    layover: 0,
    lumperReimbursement: 175,
    fuelAdvance: 400,
    deductions: 220,
    grossPay: 1876.6,
    netPay: 1256.6,
    status: "ready",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "ps-002",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    period: "Jul 6 – Jul 12, 2026",
    payMethod: "percentage",
    rateLabel: "28% of load",
    miles: 1640,
    basePay: 1480,
    bonus: 0,
    detention: 100,
    layover: 150,
    lumperReimbursement: 0,
    fuelAdvance: 250,
    deductions: 180,
    grossPay: 1730,
    netPay: 1300,
    status: "ready",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "ps-003",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    period: "Jul 6 – Jul 12, 2026",
    payMethod: "hourly",
    rateLabel: "$28 / hr",
    miles: 420,
    basePay: 980,
    bonus: 0,
    detention: 0,
    layover: 0,
    lumperReimbursement: 0,
    fuelAdvance: 100,
    deductions: 80,
    grossPay: 980,
    netPay: 800,
    status: "draft",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "ps-004",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    period: "Jun 29 – Jul 5, 2026",
    payMethod: "cpm",
    rateLabel: "$0.58 / mi",
    miles: 1920,
    basePay: 1113.6,
    bonus: 75,
    detention: 0,
    layover: 100,
    lumperReimbursement: 50,
    fuelAdvance: 300,
    deductions: 150,
    grossPay: 1338.6,
    netPay: 888.6,
    status: "paid",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "ps-005",
    driverId: "sarah-johnson",
    driverName: "Sarah Johnson",
    period: "Jul 6 – Jul 12, 2026",
    payMethod: "salary",
    rateLabel: "$1,200 / week",
    miles: 1100,
    basePay: 1200,
    bonus: 200,
    detention: 0,
    layover: 0,
    lumperReimbursement: 0,
    fuelAdvance: 0,
    deductions: 95,
    // Anomaly: high deductions relative to peers
    grossPay: 1400,
    netPay: 1105,
    status: "ready",
  },
];

export let ownerSettlementStore: OwnerSettlement[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "os-001",
    truckId: "truck-102",
    truckUnit: "102",
    ownerName: "Lone Star Alpha Carrier",
    period: "weekly",
    periodLabel: "Week of Jul 6, 2026",
    revenue: 5430,
    expenses: 1860,
    profit: 3570,
    status: "pending",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "os-002",
    truckId: "truck-104",
    truckUnit: "104",
    ownerName: "Lone Star Alpha Carrier",
    period: "weekly",
    periodLabel: "Week of Jul 6, 2026",
    revenue: 4120,
    expenses: 1540,
    profit: 2580,
    status: "pending",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "os-003",
    truckId: "truck-107",
    truckUnit: "107",
    ownerName: "Owner-Op — Mendez",
    period: "weekly",
    periodLabel: "Week of Jul 6, 2026",
    revenue: 3200,
    expenses: 2100,
    profit: 1100,
    status: "settled",
    settledAt: "2026-07-14",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "os-004",
    truckId: "truck-110",
    truckUnit: "110",
    ownerName: "Lone Star Alpha Carrier",
    period: "monthly",
    periodLabel: "June 2026",
    revenue: 18400,
    expenses: 9200,
    profit: 9200,
    status: "settled",
    settledAt: "2026-07-02",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "os-005",
    truckId: "truck-112",
    truckUnit: "112",
    ownerName: "Owner-Op — Reed",
    period: "weekly",
    periodLabel: "Week of Jul 6, 2026",
    revenue: 980,
    expenses: 1240,
    profit: -260,
    status: "pending",
  },
];

export let factoringStore: FactoringAccount[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "fac-001",
    companyName: "RTS Financial",
    advancePercent: 95,
    feePercent: 2.5,
    reservePercent: 5,
    reserveHeld: 12800,
    releasedFunds: 84600,
    outstandingAdvance: 21400,
    invoicesFactored: 38,
    status: "active",
    lastReleaseAt: "2026-07-15",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "fac-002",
    companyName: "OTR Capital",
    advancePercent: 92,
    feePercent: 3.0,
    reservePercent: 8,
    reserveHeld: 4200,
    releasedFunds: 18600,
    outstandingAdvance: 5600,
    invoicesFactored: 12,
    status: "active",
    lastReleaseAt: "2026-07-10",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "fac-003",
    companyName: "Triumph Business Capital",
    advancePercent: 90,
    feePercent: 2.75,
    reservePercent: 10,
    reserveHeld: 0,
    releasedFunds: 42000,
    outstandingAdvance: 0,
    invoicesFactored: 22,
    status: "paused",
    lastReleaseAt: "2026-05-28",
  },
];

export function listRevenue(tenantId: string): RevenueRecord[] {
  return revenueStore.filter((r) => r.tenantId === tenantId);
}

export function listExpenses(tenantId: string): ExpenseRecord[] {
  return expenseStore.filter((e) => e.tenantId === tenantId);
}

export function listInvoices(tenantId: string): FinanceInvoice[] {
  return invoiceStore.filter((i) => i.tenantId === tenantId);
}

export function listBrokerPayments(tenantId: string): BrokerPaymentRecord[] {
  return brokerPaymentStore.filter((p) => p.tenantId === tenantId);
}

export function listPayrollSettlements(
  tenantId: string,
): DriverPayrollSettlement[] {
  return payrollSettlementStore.filter((p) => p.tenantId === tenantId);
}

export function listOwnerSettlements(tenantId: string): OwnerSettlement[] {
  return ownerSettlementStore.filter((s) => s.tenantId === tenantId);
}

export function listFactoringAccounts(tenantId: string): FactoringAccount[] {
  return factoringStore.filter((f) => f.tenantId === tenantId);
}

export function getPendingRevenueWithoutInvoice(
  tenantId: string,
): RevenueRecord[] {
  const invoiceLoadIds = new Set(
    listInvoices(tenantId)
      .filter((i) => i.loadId)
      .map((i) => i.loadId as string),
  );
  return listRevenue(tenantId).filter(
    (r) =>
      (r.status === "pending" || r.status === "invoiced") &&
      !invoiceLoadIds.has(r.loadId) &&
      !r.invoiceId,
  );
}
