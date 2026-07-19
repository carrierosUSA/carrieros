import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import type {
  AccidentDraftInput,
  AccidentRecord,
  ClaimRecord,
  ComplianceReportCard,
  ComplianceTimelineEvent,
  DotInspection,
  DriverComplianceItem,
  DrugAlcoholRecord,
  SafetyTrainingRecord,
  TrailerComplianceItem,
  TruckComplianceItem,
} from "@/lib/types/compliance";

const T = DEMO_TENANT_ID;

/* ── Seed: driver compliance ─────────────────────────────────────────────── */

export const seedDriverCompliance: DriverComplianceItem[] = [
  {
    tenantId: T,
    id: "dc-onkar-cdl",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    type: "cdl",
    status: "clear",
    dueAt: "2028-06-30",
    completedAt: "2024-06-30",
  },
  {
    tenantId: T,
    id: "dc-onkar-medical",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    type: "medical",
    status: "clear",
    dueAt: "2026-12-15",
    completedAt: "2024-12-15",
  },
  {
    tenantId: T,
    id: "dc-onkar-mvr",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    type: "mvr",
    status: "clear",
    dueAt: "2027-03-01",
    completedAt: "2026-03-01",
  },
  {
    tenantId: T,
    id: "dc-onkar-ch",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    type: "clearinghouse",
    status: "clear",
    completedAt: "2026-01-10",
    notes: "Full query clear",
  },
  {
    tenantId: T,
    id: "dc-onkar-drug",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    type: "drug_test",
    status: "clear",
    dueAt: "2027-01-15",
    completedAt: "2026-01-15",
  },
  {
    tenantId: T,
    id: "dc-onkar-annual",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    type: "annual_review",
    status: "clear",
    dueAt: "2027-03-15",
    completedAt: "2026-03-15",
  },
  {
    tenantId: T,
    id: "dc-carlos-cdl",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "cdl",
    status: "expiring",
    dueAt: "2026-08-20",
  },
  {
    tenantId: T,
    id: "dc-carlos-medical",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "medical",
    status: "expiring",
    dueAt: "2026-07-30",
  },
  {
    tenantId: T,
    id: "dc-carlos-drug",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "drug_test",
    status: "due",
    dueAt: "2026-07-25",
  },
  {
    tenantId: T,
    id: "dc-carlos-random",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "random_test",
    status: "due",
    dueAt: "2026-07-20",
  },
  {
    tenantId: T,
    id: "dc-carlos-annual",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "annual_review",
    status: "expired",
    dueAt: "2026-04-12",
  },
  {
    tenantId: T,
    id: "dc-carlos-mvr",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "mvr",
    status: "expiring",
    dueAt: "2026-08-01",
  },
  {
    tenantId: T,
    id: "dc-carlos-ch",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    type: "clearinghouse",
    status: "pending",
    notes: "Limited query pending renewal",
  },
  {
    tenantId: T,
    id: "dc-marcus-medical",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    type: "medical",
    status: "expiring",
    dueAt: "2026-09-01",
  },
  {
    tenantId: T,
    id: "dc-marcus-drug",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    type: "drug_test",
    status: "due",
    dueAt: "2026-08-15",
  },
  {
    tenantId: T,
    id: "dc-marcus-training",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    type: "training_certificate",
    status: "pending",
    dueAt: "2026-07-30",
    notes: "Orientation safety module",
  },
  {
    tenantId: T,
    id: "dc-marcus-ch",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    type: "clearinghouse",
    status: "clear",
    completedAt: "2026-06-20",
  },
  {
    tenantId: T,
    id: "dc-lovepreet-cdl",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    type: "cdl",
    status: "clear",
    dueAt: "2027-04-20",
  },
  {
    tenantId: T,
    id: "dc-lovepreet-medical",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    type: "medical",
    status: "clear",
    dueAt: "2027-01-30",
  },
  {
    tenantId: T,
    id: "dc-lovepreet-annual",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    type: "annual_review",
    status: "expiring",
    dueAt: "2026-08-01",
  },
];

/* ── Seed: truck compliance ──────────────────────────────────────────────── */

export const seedTruckCompliance: TruckComplianceItem[] = [
  {
    tenantId: T,
    id: "tc-102-annual",
    truckId: "truck-102",
    unitNumber: "102",
    type: "annual_inspection",
    status: "clear",
    dueAt: "2027-02-10",
    completedAt: "2026-02-10",
  },
  {
    tenantId: T,
    id: "tc-102-reg",
    truckId: "truck-102",
    unitNumber: "102",
    type: "registration",
    status: "clear",
    dueAt: "2027-01-31",
  },
  {
    tenantId: T,
    id: "tc-102-ins",
    truckId: "truck-102",
    unitNumber: "102",
    type: "insurance",
    status: "clear",
    dueAt: "2026-12-01",
  },
  {
    tenantId: T,
    id: "tc-102-eld",
    truckId: "truck-102",
    unitNumber: "102",
    type: "eld",
    status: "clear",
    notes: "Samsara connected",
  },
  {
    tenantId: T,
    id: "tc-104-annual",
    truckId: "truck-104",
    unitNumber: "104",
    type: "annual_inspection",
    status: "expiring",
    dueAt: "2026-08-15",
  },
  {
    tenantId: T,
    id: "tc-104-ifta",
    truckId: "truck-104",
    unitNumber: "104",
    type: "ifta",
    status: "due",
    dueAt: "2026-07-31",
    notes: "Q2 filing due",
  },
  {
    tenantId: T,
    id: "tc-104-irp",
    truckId: "truck-104",
    unitNumber: "104",
    type: "irp",
    status: "clear",
    dueAt: "2027-03-01",
  },
  {
    tenantId: T,
    id: "tc-107-annual",
    truckId: "truck-107",
    unitNumber: "107",
    type: "annual_inspection",
    status: "failed",
    dueAt: "2026-06-28",
    notes: "Brake chamber failed shop inspection",
  },
  {
    tenantId: T,
    id: "tc-107-emissions",
    truckId: "truck-107",
    unitNumber: "107",
    type: "emissions",
    status: "due",
    dueAt: "2026-07-20",
  },
  {
    tenantId: T,
    id: "tc-107-ins",
    truckId: "truck-107",
    unitNumber: "107",
    type: "insurance",
    status: "clear",
    dueAt: "2026-12-01",
  },
  {
    tenantId: T,
    id: "tc-110-permits",
    truckId: "truck-110",
    unitNumber: "110",
    type: "permits",
    status: "expiring",
    dueAt: "2026-08-01",
    notes: "Oversize permit Texas corridor",
  },
  {
    tenantId: T,
    id: "tc-110-eld",
    truckId: "truck-110",
    unitNumber: "110",
    type: "eld",
    status: "pending",
    notes: "Omnitracs reconnect required",
  },
  {
    tenantId: T,
    id: "tc-112-annual",
    truckId: "truck-112",
    unitNumber: "112",
    type: "annual_inspection",
    status: "expired",
    dueAt: "2026-01-15",
  },
  {
    tenantId: T,
    id: "tc-112-reg",
    truckId: "truck-112",
    unitNumber: "112",
    type: "registration",
    status: "expired",
    dueAt: "2026-03-31",
  },
  {
    tenantId: T,
    id: "tc-112-ins",
    truckId: "truck-112",
    unitNumber: "112",
    type: "insurance",
    status: "expiring",
    dueAt: "2026-08-15",
  },
];

/* ── Seed: trailer compliance ────────────────────────────────────────────── */

export const seedTrailerCompliance: TrailerComplianceItem[] = [
  {
    tenantId: T,
    id: "trc-2201-annual",
    trailerId: "trailer-2201",
    unitNumber: "2201",
    type: "annual_inspection",
    status: "clear",
    dueAt: "2027-04-12",
    completedAt: "2026-04-12",
  },
  {
    tenantId: T,
    id: "trc-2201-reg",
    trailerId: "trailer-2201",
    unitNumber: "2201",
    type: "registration",
    status: "clear",
    dueAt: "2027-01-31",
  },
  {
    tenantId: T,
    id: "trc-2201-abs",
    trailerId: "trailer-2201",
    unitNumber: "2201",
    type: "abs_inspection",
    status: "clear",
    dueAt: "2027-04-12",
  },
  {
    tenantId: T,
    id: "trc-2201-tire",
    trailerId: "trailer-2201",
    unitNumber: "2201",
    type: "tire_inspection",
    status: "clear",
    completedAt: "2026-06-01",
  },
  {
    tenantId: T,
    id: "trc-2204-reefer",
    trailerId: "trailer-2204",
    unitNumber: "2204",
    type: "reefer_inspection",
    status: "expiring",
    dueAt: "2026-08-01",
  },
  {
    tenantId: T,
    id: "trc-2204-annual",
    trailerId: "trailer-2204",
    unitNumber: "2204",
    type: "annual_inspection",
    status: "clear",
    dueAt: "2027-06-01",
  },
  {
    tenantId: T,
    id: "trc-2210-annual",
    trailerId: "trailer-2210",
    unitNumber: "2210",
    type: "annual_inspection",
    status: "failed",
    dueAt: "2025-11-20",
    notes: "Frame crack noted — in shop",
  },
  {
    tenantId: T,
    id: "trc-2210-tire",
    trailerId: "trailer-2210",
    unitNumber: "2210",
    type: "tire_inspection",
    status: "due",
    dueAt: "2026-07-18",
  },
  {
    tenantId: T,
    id: "trc-2228-reefer",
    trailerId: "trailer-2228",
    unitNumber: "2228",
    type: "reefer_inspection",
    status: "expired",
    dueAt: "2026-02-01",
  },
  {
    tenantId: T,
    id: "trc-2228-annual",
    trailerId: "trailer-2228",
    unitNumber: "2228",
    type: "annual_inspection",
    status: "expired",
    dueAt: "2025-08-14",
  },
  {
    tenantId: T,
    id: "trc-2220-tire",
    trailerId: "trailer-2220",
    unitNumber: "2220",
    type: "tire_inspection",
    status: "clear",
    completedAt: "2026-05-22",
  },
  {
    tenantId: T,
    id: "trc-2215-abs",
    trailerId: "trailer-2215",
    unitNumber: "2215",
    type: "abs_inspection",
    status: "expiring",
    dueAt: "2026-08-10",
  },
];

/* ── Seed: DOT inspections ───────────────────────────────────────────────── */

export const seedDotInspections: DotInspection[] = [
  {
    tenantId: T,
    id: "insp-001",
    date: "2026-07-08",
    level: "I",
    officer: "Trooper R. Hale",
    location: "I-35 NB, San Antonio, TX",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    truckId: "truck-102",
    truckUnit: "102",
    trailerId: "trailer-2201",
    trailerUnit: "2201",
    violations: [],
    outOfService: false,
    documentCount: 2,
    photoCount: 0,
    result: "passed",
  },
  {
    tenantId: T,
    id: "insp-002",
    date: "2026-06-22",
    level: "II",
    officer: "Officer M. Benton",
    location: "I-10 WB, Sealy, TX",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    truckId: "truck-110",
    truckUnit: "110",
    violations: ["Speeding — 72 in 65", "Log form & manner"],
    outOfService: false,
    documentCount: 1,
    photoCount: 2,
    result: "failed",
    notes: "Citation issued; no OOS",
  },
  {
    tenantId: T,
    id: "insp-003",
    date: "2026-05-14",
    level: "V",
    officer: "Inspector L. Cho",
    location: "Austin Yard, TX",
    truckId: "truck-107",
    truckUnit: "107",
    violations: ["Brake chamber defect"],
    outOfService: true,
    documentCount: 3,
    photoCount: 4,
    result: "oos",
    notes: "Unit placed out of service pending brake repair",
  },
  {
    tenantId: T,
    id: "insp-004",
    date: "2026-03-02",
    level: "III",
    officer: "Trooper J. Ortiz",
    location: "I-35 SB, New Braunfels, TX",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    truckId: "truck-102",
    truckUnit: "102",
    violations: ["Logbook form & manner"],
    outOfService: false,
    documentCount: 1,
    photoCount: 0,
    result: "failed",
  },
  {
    tenantId: T,
    id: "insp-005",
    date: "2026-01-18",
    level: "I",
    officer: "Officer K. Singh",
    location: "US-281, San Antonio, TX",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    truckId: "truck-104",
    truckUnit: "104",
    trailerId: "trailer-2204",
    trailerUnit: "2204",
    violations: [],
    outOfService: false,
    documentCount: 2,
    photoCount: 1,
    result: "passed",
  },
];

/* ── Seed: accidents ─────────────────────────────────────────────────────── */

let accidentSeq = 3;

export const seedAccidents: AccidentRecord[] = [
  {
    tenantId: T,
    id: "acc-001",
    occurredAt: "2026-06-18T16:20:00Z",
    status: "closed",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    truckId: "truck-102",
    truckUnit: "102",
    trailerId: "trailer-2201",
    trailerUnit: "2201",
    loadId: "load-24009",
    loadReference: "LD-24009",
    location: "I-35 near San Antonio, TX",
    gpsLat: 29.4241,
    gpsLng: -98.4936,
    description: "Hard braking event — no collision. Telematics-triggered review.",
    photoCount: 2,
    hasPoliceReport: false,
    witnesses: [],
    repairStatus: "none",
  },
  {
    tenantId: T,
    id: "acc-002",
    occurredAt: "2026-05-20T09:45:00Z",
    status: "open",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    truckId: "truck-110",
    truckUnit: "110",
    trailerId: "trailer-2215",
    trailerUnit: "2215",
    loadId: "load-24010",
    loadReference: "LD-24010",
    location: "Parking lot, Houston Terminal",
    description:
      "Trailer dock scrape while backing. Minor side panel damage; no injuries.",
    photoCount: 5,
    hasPoliceReport: false,
    witnesses: ["Yard attendant — Mike Torres"],
    insuranceClaimId: "claim-001",
    repairStatus: "in_progress",
  },
];

/* ── Seed: claims ────────────────────────────────────────────────────────── */

export const seedClaims: ClaimRecord[] = [
  {
    tenantId: T,
    id: "claim-001",
    type: "damage",
    status: "negotiating",
    title: "Trailer panel repair — Unit 2215",
    amount: 2850,
    openedAt: "2026-05-21",
    relatedAccidentId: "acc-002",
    loadId: "load-24010",
    loadReference: "LD-24010",
    notes: "Body shop estimate approved pending deductable",
  },
  {
    tenantId: T,
    id: "claim-002",
    type: "cargo",
    status: "open",
    title: "Temperature excursion — reefer load",
    amount: 4200,
    openedAt: "2026-07-02",
    loadId: "load-24016",
    loadReference: "LD-24016",
    brokerName: "Freightline Logistics",
    customerName: "Gulf Foods",
    notes: "Broker notified; awaiting temp log export",
  },
  {
    tenantId: T,
    id: "claim-003",
    type: "broker",
    status: "submitted",
    title: "Detention dispute — LD-24013",
    amount: 350,
    openedAt: "2026-07-04",
    loadId: "load-24013",
    loadReference: "LD-24013",
    brokerName: "Capital Freight",
  },
  {
    tenantId: T,
    id: "claim-004",
    type: "insurance",
    status: "settled",
    title: "Glass claim — Unit 102 windshield",
    amount: 680,
    openedAt: "2026-04-10",
    notes: "Settled with Progressive Commercial",
  },
];

/* ── Seed: drug & alcohol ────────────────────────────────────────────────── */

export const seedDrugAlcohol: DrugAlcoholRecord[] = [
  {
    tenantId: T,
    id: "da-onkar-1",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    kind: "random",
    result: "negative",
    completedAt: "2026-01-15",
    nextDueAt: "2027-01-15",
  },
  {
    tenantId: T,
    id: "da-carlos-1",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    kind: "random",
    result: "scheduled",
    scheduledAt: "2026-07-20",
    nextDueAt: "2026-07-25",
  },
  {
    tenantId: T,
    id: "da-marcus-1",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    kind: "pre_employment",
    result: "negative",
    completedAt: "2026-06-20",
    nextDueAt: "2026-08-15",
  },
  {
    tenantId: T,
    id: "da-marcus-2",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    kind: "random",
    result: "scheduled",
    scheduledAt: "2026-08-12",
  },
  {
    tenantId: T,
    id: "da-lovepreet-1",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    kind: "random",
    result: "negative",
    completedAt: "2025-11-01",
    nextDueAt: "2026-11-01",
  },
];

/* ── Seed: training ──────────────────────────────────────────────────────── */

export const seedTraining: SafetyTrainingRecord[] = [
  {
    tenantId: T,
    id: "tr-marcus-1",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    course: "New Driver Safety Orientation",
    status: "overdue",
    assignedAt: "2026-06-20",
    dueAt: "2026-07-05",
  },
  {
    tenantId: T,
    id: "tr-marcus-2",
    driverId: "marcus-reed",
    driverName: "Aman Singh",
    course: "Hours of Service Basics",
    status: "assigned",
    assignedAt: "2026-07-01",
    dueAt: "2026-07-25",
  },
  {
    tenantId: T,
    id: "tr-carlos-1",
    driverId: "carlos-mendez",
    driverName: "Carlos Mendez",
    course: "Defensive Driving Refresh",
    status: "overdue",
    assignedAt: "2026-05-20",
    dueAt: "2026-06-20",
  },
  {
    tenantId: T,
    id: "tr-onkar-1",
    driverId: "onkar-singh",
    driverName: "Onkar Singh",
    course: "Hazmat Awareness",
    status: "completed",
    assignedAt: "2026-02-01",
    dueAt: "2026-03-01",
    completedAt: "2026-02-18",
    certificateId: "cert-onkar-hazmat",
  },
  {
    tenantId: T,
    id: "tr-lovepreet-1",
    driverId: "lovepreet-kaur",
    driverName: "Lovepreet Kaur",
    course: "Accident Scene Protocol",
    status: "in_progress",
    assignedAt: "2026-07-01",
    dueAt: "2026-07-31",
  },
];

/* ── Seed: timeline ──────────────────────────────────────────────────────── */

export const seedComplianceTimeline: ComplianceTimelineEvent[] = [
  {
    tenantId: T,
    id: "ctl-001",
    label: "Level I inspection passed",
    detail: "Onkar Singh · Unit 102 · No violations",
    occurredAt: "2026-07-08T14:30:00Z",
    category: "inspection",
    entityLabel: "Unit 102",
    href: "/compliance?tab=inspections",
  },
  {
    tenantId: T,
    id: "ctl-002",
    label: "Cargo claim opened",
    detail: "Temperature excursion on LD-24016",
    occurredAt: "2026-07-02T11:00:00Z",
    category: "claim",
    entityLabel: "LD-24016",
    href: "/compliance?tab=claims",
  },
  {
    tenantId: T,
    id: "ctl-003",
    label: "Random drug test scheduled",
    detail: "Carlos Mendez · July 20",
    occurredAt: "2026-07-01T09:00:00Z",
    category: "drug_test",
    entityLabel: "Carlos Mendez",
    href: "/compliance?tab=drug_alcohol",
  },
  {
    tenantId: T,
    id: "ctl-004",
    label: "Training assigned",
    detail: "Aman Singh · Hours of Service Basics",
    occurredAt: "2026-07-01T08:30:00Z",
    category: "training",
    entityLabel: "Aman Singh",
    href: "/compliance?tab=training",
  },
  {
    tenantId: T,
    id: "ctl-005",
    label: "Medical card expiring soon",
    detail: "Carlos Mendez · due July 30",
    occurredAt: "2026-06-30T10:00:00Z",
    category: "document",
    entityLabel: "Carlos Mendez",
    href: "/compliance?tab=drivers",
  },
  {
    tenantId: T,
    id: "ctl-006",
    label: "Unit 107 placed out of service",
    detail: "Level V inspection — brake chamber defect",
    occurredAt: "2026-05-14T16:00:00Z",
    category: "inspection",
    entityLabel: "Unit 107",
    href: "/compliance?tab=inspections",
  },
  {
    tenantId: T,
    id: "ctl-007",
    label: "Accident reported",
    detail: "Trailer dock scrape · Houston Terminal",
    occurredAt: "2026-05-20T09:45:00Z",
    category: "accident",
    entityLabel: "Unit 110",
    href: "/compliance?tab=accidents",
  },
  {
    tenantId: T,
    id: "ctl-008",
    label: "Clearinghouse query clear",
    detail: "Onkar Singh · full query",
    occurredAt: "2026-01-10T12:00:00Z",
    category: "integration",
    entityLabel: "Onkar Singh",
  },
];

/* ── Seed: reports ───────────────────────────────────────────────────────── */

export const seedComplianceReports: ComplianceReportCard[] = [
  {
    id: "rpt-dot",
    type: "dot_score",
    title: "DOT Score",
    description: "Fleet DOT readiness and inspection outcomes.",
    lastGeneratedAt: "2026-07-15T08:00:00Z",
    status: "ready",
  },
  {
    id: "rpt-csa",
    type: "csa",
    title: "CSA Report",
    description: "BASIC percentiles and intervention readiness.",
    lastGeneratedAt: "2026-07-10T08:00:00Z",
    status: "ready",
  },
  {
    id: "rpt-driver",
    type: "driver_safety",
    title: "Driver Safety Report",
    description: "Per-driver violations, training, and risk signals.",
    lastGeneratedAt: "2026-07-14T08:00:00Z",
    status: "ready",
  },
  {
    id: "rpt-fleet",
    type: "fleet_safety",
    title: "Fleet Safety Report",
    description: "Truck and trailer inspection and equipment readiness.",
    lastGeneratedAt: "2026-07-12T08:00:00Z",
    status: "stale",
  },
  {
    id: "rpt-accident",
    type: "accident",
    title: "Accident Report",
    description: "Open and closed accidents with claim linkage.",
    lastGeneratedAt: "2026-07-16T08:00:00Z",
    status: "ready",
  },
  {
    id: "rpt-violation",
    type: "violation",
    title: "Violation Report",
    description: "Active and historical roadside violations.",
    lastGeneratedAt: "2026-07-11T08:00:00Z",
    status: "ready",
  },
];

/* ── Mutable store ───────────────────────────────────────────────────────── */

let driverCompliance = [...seedDriverCompliance];
let truckCompliance = [...seedTruckCompliance];
let trailerCompliance = [...seedTrailerCompliance];
let inspections = [...seedDotInspections];
let accidents = [...seedAccidents];
let claims = [...seedClaims];
let drugAlcohol = [...seedDrugAlcohol];
let training = [...seedTraining];
let timeline = [...seedComplianceTimeline];
let reports = [...seedComplianceReports];

export function listDriverCompliance(tenantId: string): DriverComplianceItem[] {
  return driverCompliance.filter((item) => item.tenantId === tenantId);
}

export function listTruckCompliance(tenantId: string): TruckComplianceItem[] {
  return truckCompliance.filter((item) => item.tenantId === tenantId);
}

export function listTrailerCompliance(tenantId: string): TrailerComplianceItem[] {
  return trailerCompliance.filter((item) => item.tenantId === tenantId);
}

export function listDotInspections(tenantId: string): DotInspection[] {
  return inspections
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function listAccidents(tenantId: string): AccidentRecord[] {
  return accidents
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function listClaims(tenantId: string): ClaimRecord[] {
  return claims
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}

export function listDrugAlcohol(tenantId: string): DrugAlcoholRecord[] {
  return drugAlcohol.filter((item) => item.tenantId === tenantId);
}

export function listTraining(tenantId: string): SafetyTrainingRecord[] {
  return training.filter((item) => item.tenantId === tenantId);
}

export function listComplianceTimeline(
  tenantId: string,
): ComplianceTimelineEvent[] {
  return timeline
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function listComplianceReports(): ComplianceReportCard[] {
  return [...reports];
}

export function addAccident(
  tenantId: string,
  input: AccidentDraftInput,
): AccidentRecord {
  accidentSeq += 1;
  const record: AccidentRecord = {
    tenantId,
    id: `acc-${String(accidentSeq).padStart(3, "0")}`,
    occurredAt: input.occurredAt,
    status: "open",
    driverId: input.driverId,
    driverName: input.driverName,
    truckId: input.truckId,
    truckUnit: input.truckUnit,
    trailerId: input.trailerId,
    trailerUnit: input.trailerUnit,
    loadId: input.loadId,
    loadReference: input.loadReference,
    location: input.location,
    description: input.description,
    photoCount: 0,
    hasPoliceReport: input.hasPoliceReport,
    witnesses: input.witnesses,
    repairStatus: "pending",
  };
  accidents = [record, ...accidents];
  timeline = [
    {
      tenantId,
      id: `ctl-acc-${record.id}`,
      label: "Accident reported",
      detail: `${record.driverName} · ${record.location}`,
      occurredAt: new Date().toISOString(),
      category: "accident",
      entityLabel: record.truckUnit
        ? `Unit ${record.truckUnit}`
        : record.driverName,
      href: "/compliance?tab=accidents",
    },
    ...timeline,
  ];
  return record;
}

export function markReportGenerated(reportId: string): ComplianceReportCard | null {
  const index = reports.findIndex((r) => r.id === reportId);
  if (index < 0) return null;
  const updated: ComplianceReportCard = {
    ...reports[index],
    status: "ready",
    lastGeneratedAt: new Date().toISOString(),
  };
  reports = reports.map((r, i) => (i === index ? updated : r));
  return updated;
}
