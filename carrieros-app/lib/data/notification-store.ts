import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import type {
  CarrierNotification,
  NotificationPreferences,
} from "@/lib/types/notifications";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types/notifications";

/**
 * Seed clock: Friday Jul 17, 2026 (matches demo data).
 * Groups: Today / Yesterday / This Week / Earlier
 */
const T = {
  todayMorning: "2026-07-17T08:12:00Z",
  todayMid: "2026-07-17T11:40:00Z",
  todayRecent: "2026-07-17T15:05:00Z",
  todayLatest: "2026-07-17T16:22:00Z",
  yesterdayAm: "2026-07-16T09:18:00Z",
  yesterdayPm: "2026-07-16T18:44:00Z",
  wed: "2026-07-15T14:10:00Z",
  tue: "2026-07-14T10:05:00Z",
  mon: "2026-07-13T16:30:00Z",
  lastWeek: "2026-07-09T12:00:00Z",
  earlier: "2026-07-03T09:00:00Z",
} as const;

export const notificationSeed: CarrierNotification[] = [
  // ── Dispatch ──────────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-d-001",
    category: "dispatch",
    type: "new_load",
    title: "New load available",
    body: "LD-24001 Dallas → Phoenix needs a driver and truck.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.todayLatest,
    entityRefs: [{ type: "load", id: "load-24001", label: "LD-24001" }],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24001",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "desktop"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-d-002",
    category: "dispatch",
    type: "load_assigned",
    title: "Load assigned",
    body: "Onkar Singh assigned to LD-24002 with unit 102.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.todayMid,
    readAt: T.todayMid,
    entityRefs: [
      { type: "load", id: "load-24002", label: "LD-24002" },
      { type: "driver", id: "onkar-singh", label: "Onkar Singh" },
    ],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24002",
        primary: true,
      },
      {
        id: "view-driver",
        label: "View Driver",
        kind: "navigate",
        href: "/drivers/onkar-singh",
      },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-d-003",
    category: "dispatch",
    type: "driver_changed",
    title: "Driver changed on LD-24003",
    body: "Lovepreet Kaur replaced the previous driver for Houston → Atlanta.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.yesterdayPm,
    entityRefs: [
      { type: "load", id: "load-24003", label: "LD-24003" },
      { type: "driver", id: "lovepreet-kaur", label: "Lovepreet Kaur" },
    ],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24003",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-d-004",
    category: "dispatch",
    type: "appointment_changed",
    title: "Appointment changed",
    body: "Delivery window for LD-24004 moved to 4:00 PM local.",
    priority: "high",
    alphTier: "immediate_action",
    createdAt: T.todayMorning,
    entityRefs: [{ type: "load", id: "load-24004", label: "LD-24004" }],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24004",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "sms"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-d-005",
    category: "dispatch",
    type: "delay",
    title: "Delay on LD-24006",
    body: "Traffic near I-10 — ETA slipped 70 minutes.",
    priority: "critical",
    alphTier: "immediate_action",
    createdAt: T.todayRecent,
    entityRefs: [{ type: "load", id: "load-24006", label: "LD-24006" }],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24006",
        primary: true,
      },
      {
        id: "track",
        label: "Live Tracking",
        kind: "navigate",
        href: "/loads/load-24006/tracking",
      },
    ],
    channels: ["in_app", "push", "desktop", "sms"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-d-006",
    category: "dispatch",
    type: "delivery_completed",
    title: "Delivery completed",
    body: "LD-24005 delivered successfully. Ready for POD and invoice.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.wed,
    entityRefs: [{ type: "load", id: "load-24005", label: "LD-24005" }],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24005",
        primary: true,
      },
      {
        id: "docs-health",
        label: "Document Health",
        kind: "navigate",
        href: "/documents/health",
      },
    ],
    channels: ["in_app", "email"],
  },

  // ── Driver ────────────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-001",
    category: "driver",
    type: "accepted_load",
    title: "Driver accepted load",
    body: "Onkar Singh accepted LD-24002.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.todayMorning,
    readAt: T.todayMid,
    entityRefs: [
      { type: "driver", id: "onkar-singh", label: "Onkar Singh" },
      { type: "load", id: "load-24002", label: "LD-24002" },
    ],
    actions: [
      {
        id: "view-driver",
        label: "View Driver",
        kind: "navigate",
        href: "/drivers/onkar-singh",
        primary: true,
      },
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24002",
      },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-002",
    category: "driver",
    type: "rejected_load",
    title: "Driver rejected load",
    body: "Lovepreet Kaur declined LD-24001 — HOS conflict.",
    priority: "high",
    alphTier: "immediate_action",
    createdAt: T.yesterdayAm,
    entityRefs: [
      { type: "driver", id: "lovepreet-kaur", label: "Lovepreet Kaur" },
      { type: "load", id: "load-24001", label: "LD-24001" },
    ],
    actions: [
      {
        id: "view-load",
        label: "Reassign",
        kind: "navigate",
        href: "/loads/load-24001",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-003",
    category: "driver",
    type: "checked_in",
    title: "Driver checked in",
    body: "Onkar Singh checked in at Dallas pickup.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.tue,
    entityRefs: [
      { type: "driver", id: "onkar-singh", label: "Onkar Singh" },
      { type: "load", id: "load-24002", label: "LD-24002" },
    ],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24002",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-004",
    category: "driver",
    type: "checked_out",
    title: "Driver checked out",
    body: "Lovepreet Kaur checked out — available for next dispatch.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.todayRecent,
    entityRefs: [
      { type: "driver", id: "lovepreet-kaur", label: "Lovepreet Kaur" },
    ],
    actions: [
      {
        id: "view-driver",
        label: "View Driver",
        kind: "navigate",
        href: "/drivers/lovepreet-kaur",
        primary: true,
      },
      {
        id: "dispatch",
        label: "Open Dispatch",
        kind: "navigate",
        href: "/loads",
      },
    ],
    channels: ["in_app", "desktop"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-005",
    category: "driver",
    type: "uploaded_pod",
    title: "Driver uploaded POD",
    body: "POD photo received for LD-24005.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.wed,
    entityRefs: [
      { type: "load", id: "load-24005", label: "LD-24005" },
      { type: "document", id: "doc-pod-24005", label: "POD" },
    ],
    actions: [
      {
        id: "open-docs",
        label: "Review Document",
        kind: "navigate",
        href: "/documents",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-006",
    category: "driver",
    type: "started_detention",
    title: "Detention started",
    body: "Driver started detention clock at receiver for LD-24004.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.yesterdayPm,
    entityRefs: [{ type: "load", id: "load-24004", label: "LD-24004" }],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24004",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-dr-007",
    category: "driver",
    type: "completed_delivery",
    title: "Driver completed delivery",
    body: "Onkar Singh marked LD-24005 complete.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.mon,
    readAt: T.tue,
    entityRefs: [
      { type: "driver", id: "onkar-singh", label: "Onkar Singh" },
      { type: "load", id: "load-24005", label: "LD-24005" },
    ],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24005",
        primary: true,
      },
    ],
    channels: ["in_app"],
  },

  // ── Documents ─────────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-doc-001",
    category: "documents",
    type: "pod_uploaded",
    title: "POD uploaded",
    body: "Proof of delivery filed for LD-24005.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.wed,
    entityRefs: [
      { type: "document", id: "doc-pod-24005", label: "POD" },
      { type: "load", id: "load-24005", label: "LD-24005" },
    ],
    actions: [
      {
        id: "open-docs",
        label: "Open Documents",
        kind: "navigate",
        href: "/documents",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-doc-002",
    category: "documents",
    type: "missing_pod",
    title: "Missing POD",
    body: "LD-24006 delivered but POD is still missing.",
    priority: "critical",
    alphTier: "immediate_action",
    createdAt: T.todayMorning,
    entityRefs: [{ type: "load", id: "load-24006", label: "LD-24006" }],
    actions: [
      {
        id: "request-driver",
        label: "Request Driver",
        kind: "navigate",
        href: "/documents/requests",
        primary: true,
      },
      {
        id: "upload",
        label: "Upload",
        kind: "navigate",
        href: "/documents",
      },
      { id: "ignore", label: "Ignore", kind: "ignore" },
    ],
    channels: ["in_app", "push", "email", "sms"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-doc-003",
    category: "documents",
    type: "invoice_created",
    title: "Invoice created",
    body: "Invoice draft ready for LD-24005.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.todayMid,
    entityRefs: [
      { type: "invoice", id: "inv-24005", label: "INV-24005" },
      { type: "load", id: "load-24005", label: "LD-24005" },
    ],
    actions: [
      {
        id: "open-finance",
        label: "Open Invoice",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-doc-004",
    category: "documents",
    type: "missing_invoice",
    title: "Missing invoice",
    body: "LD-24004 needs an invoice before settlement.",
    priority: "high",
    alphTier: "immediate_action",
    createdAt: T.yesterdayAm,
    entityRefs: [{ type: "load", id: "load-24004", label: "LD-24004" }],
    actions: [
      {
        id: "open-finance",
        label: "Create Invoice",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      {
        id: "docs-health",
        label: "Document Health",
        kind: "navigate",
        href: "/documents/health",
      },
      { id: "ignore", label: "Ignore", kind: "ignore" },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-doc-005",
    category: "documents",
    type: "ocr_completed",
    title: "OCR completed",
    body: "Alph finished reading rate con for LD-24001 — review fields.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.todayRecent,
    entityRefs: [
      { type: "document", id: "doc-ratecon-24001", label: "Rate Con" },
      { type: "load", id: "load-24001", label: "LD-24001" },
    ],
    actions: [
      {
        id: "open-docs",
        label: "Review OCR",
        kind: "navigate",
        href: "/documents",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "desktop"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-doc-006",
    category: "documents",
    type: "document_rejected",
    title: "Document rejected",
    body: "Broker rejected BOL scan — image too blurry.",
    priority: "high",
    alphTier: "immediate_action",
    createdAt: T.tue,
    entityRefs: [
      { type: "document", id: "doc-bol-24003", label: "BOL" },
      { type: "load", id: "load-24003", label: "LD-24003" },
    ],
    actions: [
      {
        id: "docs-health",
        label: "Fix Document",
        kind: "navigate",
        href: "/documents/health",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "email"],
  },

  // ── Accounting ────────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-acc-001",
    category: "accounting",
    type: "invoice_sent",
    title: "Invoice sent",
    body: "INV-24005 emailed to Freightline.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.yesterdayPm,
    readAt: T.todayMorning,
    entityRefs: [
      { type: "invoice", id: "inv-24005", label: "INV-24005" },
      { type: "broker", id: "broker-freightline", label: "Freightline" },
    ],
    actions: [
      {
        id: "open-finance",
        label: "Open Invoice",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-acc-002",
    category: "accounting",
    type: "payment_received",
    title: "Payment received",
    body: "$2,850 received for INV-24005.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.todayLatest,
    entityRefs: [{ type: "invoice", id: "inv-24005", label: "INV-24005" }],
    actions: [
      {
        id: "open-finance",
        label: "Open Invoice",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "desktop"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-acc-003",
    category: "accounting",
    type: "payment_overdue",
    title: "Payment overdue",
    body: "INV-24004 is 12 days past due — $3,100 outstanding.",
    priority: "critical",
    alphTier: "immediate_action",
    createdAt: T.todayMorning,
    entityRefs: [{ type: "invoice", id: "inv-24004", label: "INV-24004" }],
    actions: [
      {
        id: "open-finance",
        label: "Open Invoice",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "email", "push"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-acc-004",
    category: "accounting",
    type: "payroll_ready",
    title: "Payroll ready",
    body: "Weekly driver payroll is ready to review and release.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.todayMid,
    entityRefs: [],
    actions: [
      {
        id: "open-payroll",
        label: "Open Payroll",
        kind: "navigate",
        href: "/payroll",
        primary: true,
      },
      {
        id: "open-finance",
        label: "Finance",
        kind: "navigate",
        href: "/finance",
      },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-acc-005",
    category: "accounting",
    type: "settlement_completed",
    title: "Settlement completed",
    body: "Owner settlement for week of Jul 7 closed successfully.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.lastWeek,
    readAt: T.mon,
    entityRefs: [],
    actions: [
      {
        id: "open-finance",
        label: "View Finance",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      { id: "archive", label: "Archive", kind: "archive" },
    ],
    channels: ["in_app"],
  },

  // ── Maintenance ───────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-m-001",
    category: "maintenance",
    type: "pm_due",
    title: "PM due",
    body: "Unit 102 oil + filter service is due within 500 miles.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.todayMorning,
    entityRefs: [{ type: "truck", id: "truck-102", label: "Unit 102" }],
    actions: [
      {
        id: "open-maint",
        label: "Open Maintenance",
        kind: "navigate",
        href: "/fleet/maintenance",
        primary: true,
      },
      {
        id: "view-truck",
        label: "View Truck",
        kind: "navigate",
        href: "/fleet/trucks/truck-102",
      },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-m-002",
    category: "maintenance",
    type: "repair_completed",
    title: "Repair completed",
    body: "Brake job on Unit 88 closed — truck returned to service.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.yesterdayAm,
    readAt: T.yesterdayPm,
    entityRefs: [{ type: "truck", id: "truck-88", label: "Unit 88" }],
    actions: [
      {
        id: "open-maint",
        label: "Maintenance",
        kind: "navigate",
        href: "/fleet/maintenance",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-m-003",
    category: "maintenance",
    type: "breakdown_reported",
    title: "Breakdown reported",
    body: "Unit 55 reported roadside issue near El Paso — dispatch needed.",
    priority: "critical",
    alphTier: "immediate_action",
    createdAt: T.todayLatest,
    entityRefs: [{ type: "truck", id: "truck-55", label: "Unit 55" }],
    actions: [
      {
        id: "open-maint",
        label: "Open Maintenance",
        kind: "navigate",
        href: "/fleet/maintenance",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "sms", "desktop"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-m-004",
    category: "maintenance",
    type: "tire_replacement_due",
    title: "Tire replacement due",
    body: "Trailer T-12 steer tires below tread threshold.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.tue,
    entityRefs: [{ type: "trailer", id: "trailer-12", label: "T-12" }],
    actions: [
      {
        id: "open-maint",
        label: "Schedule Service",
        kind: "navigate",
        href: "/fleet/maintenance",
        primary: true,
      },
      {
        id: "view-trailer",
        label: "View Trailer",
        kind: "navigate",
        href: "/fleet/trailers",
      },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-m-005",
    category: "maintenance",
    type: "warranty_expiring",
    title: "Warranty expiring",
    body: "Engine warranty on Unit 102 expires in 18 days.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.mon,
    entityRefs: [{ type: "truck", id: "truck-102", label: "Unit 102" }],
    actions: [
      {
        id: "open-maint",
        label: "Review Warranty",
        kind: "navigate",
        href: "/fleet/maintenance",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app"],
  },

  // ── Safety ────────────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-s-001",
    category: "safety",
    type: "cdl_expiring",
    title: "CDL expiring",
    body: "Lovepreet Kaur’s CDL expires in 28 days.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.todayMid,
    entityRefs: [
      { type: "driver", id: "lovepreet-kaur", label: "Lovepreet Kaur" },
    ],
    actions: [
      {
        id: "open-compliance",
        label: "Open Compliance",
        kind: "navigate",
        href: "/compliance",
        primary: true,
      },
      {
        id: "view-driver",
        label: "View Driver",
        kind: "navigate",
        href: "/drivers/lovepreet-kaur",
      },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-s-002",
    category: "safety",
    type: "medical_expiring",
    title: "Medical card expiring",
    body: "Onkar Singh’s medical certificate expires Dec 15 — schedule renewal.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.wed,
    entityRefs: [
      { type: "driver", id: "onkar-singh", label: "Onkar Singh" },
    ],
    actions: [
      {
        id: "open-compliance",
        label: "Open Compliance",
        kind: "navigate",
        href: "/compliance",
        primary: true,
      },
      {
        id: "view-driver",
        label: "Driver Medical",
        kind: "navigate",
        href: "/drivers/onkar-singh/medical",
      },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-s-003",
    category: "safety",
    type: "insurance_expiring",
    title: "Insurance expiring",
    body: "Fleet liability policy renews in 21 days.",
    priority: "high",
    alphTier: "immediate_action",
    createdAt: T.yesterdayAm,
    entityRefs: [],
    actions: [
      {
        id: "open-compliance",
        label: "Open Compliance",
        kind: "navigate",
        href: "/compliance",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "email", "push"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-s-004",
    category: "safety",
    type: "dot_inspection",
    title: "DOT inspection logged",
    body: "Level 2 inspection passed for Unit 102 — no violations.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.lastWeek,
    readAt: T.lastWeek,
    entityRefs: [{ type: "truck", id: "truck-102", label: "Unit 102" }],
    actions: [
      {
        id: "open-compliance",
        label: "View Compliance",
        kind: "navigate",
        href: "/compliance",
        primary: true,
      },
      { id: "archive", label: "Archive", kind: "archive" },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-s-005",
    category: "safety",
    type: "accident_reported",
    title: "Accident reported",
    body: "Minor incident reported — open claim workflow in Compliance.",
    priority: "critical",
    alphTier: "immediate_action",
    createdAt: T.todayRecent,
    entityRefs: [
      { type: "driver", id: "onkar-singh", label: "Onkar Singh" },
    ],
    actions: [
      {
        id: "open-compliance",
        label: "Open Compliance",
        kind: "navigate",
        href: "/compliance",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "sms", "desktop", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-s-006",
    category: "safety",
    type: "drug_test_due",
    title: "Drug test due",
    body: "Random drug test due for Lovepreet Kaur this week.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.mon,
    entityRefs: [
      { type: "driver", id: "lovepreet-kaur", label: "Lovepreet Kaur" },
    ],
    actions: [
      {
        id: "open-compliance",
        label: "Schedule Test",
        kind: "navigate",
        href: "/compliance",
        primary: true,
      },
      {
        id: "view-driver",
        label: "View Driver",
        kind: "navigate",
        href: "/drivers/lovepreet-kaur",
      },
    ],
    channels: ["in_app", "email"],
  },

  // ── Broker Portal ─────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-b-001",
    category: "broker",
    type: "new_load_request",
    title: "New load request",
    body: "Freightline requested capacity Dallas → Phoenix for Monday.",
    priority: "high",
    alphTier: "should_review_today",
    createdAt: T.todayLatest,
    entityRefs: [
      { type: "broker", id: "broker-freightline", label: "Freightline" },
    ],
    actions: [
      {
        id: "open-portal",
        label: "Open Portal",
        kind: "navigate",
        href: "/portal",
        primary: true,
      },
      {
        id: "open-loads",
        label: "Dispatch",
        kind: "navigate",
        href: "/loads",
      },
    ],
    channels: ["in_app", "push"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-b-002",
    category: "broker",
    type: "document_uploaded",
    title: "Broker uploaded document",
    body: "Rate confirmation uploaded via portal for LD-24001.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.yesterdayPm,
    entityRefs: [
      { type: "load", id: "load-24001", label: "LD-24001" },
      { type: "broker", id: "broker-freightline", label: "Freightline" },
    ],
    actions: [
      {
        id: "open-docs",
        label: "View Document",
        kind: "navigate",
        href: "/documents",
        primary: true,
      },
      {
        id: "open-portal",
        label: "Portal",
        kind: "navigate",
        href: "/portal",
      },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-b-003",
    category: "broker",
    type: "message_received",
    title: "Message received",
    body: "Broker asked about lumper reimbursement on LD-24003.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.todayMid,
    entityRefs: [
      { type: "broker", id: "broker-freightline", label: "Freightline" },
      { type: "load", id: "load-24003", label: "LD-24003" },
    ],
    actions: [
      {
        id: "open-portal",
        label: "Reply in Portal",
        kind: "navigate",
        href: "/portal",
        primary: true,
      },
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24003",
      },
    ],
    channels: ["in_app", "desktop"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-b-004",
    category: "broker",
    type: "invoice_viewed",
    title: "Invoice viewed",
    body: "Freightline opened INV-24005 in the portal.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.tue,
    readAt: T.wed,
    entityRefs: [
      { type: "invoice", id: "inv-24005", label: "INV-24005" },
      { type: "broker", id: "broker-freightline", label: "Freightline" },
    ],
    actions: [
      {
        id: "open-finance",
        label: "Open Invoice",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app"],
  },

  // ── System ────────────────────────────────────────────────
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-sys-001",
    category: "system",
    type: "new_user",
    title: "New user invited",
    body: "Dispatcher account created for Maya Patel.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.mon,
    entityRefs: [{ type: "user", id: "user-maya", label: "Maya Patel" }],
    actions: [
      {
        id: "open-settings",
        label: "Open Settings",
        kind: "navigate",
        href: "/settings",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-sys-002",
    category: "system",
    type: "login_alert",
    title: "Login alert",
    body: "New sign-in from San Antonio on Chrome — looks familiar.",
    priority: "medium",
    alphTier: "should_review_today",
    createdAt: T.todayMorning,
    entityRefs: [],
    actions: [
      {
        id: "open-settings",
        label: "Security",
        kind: "navigate",
        href: "/settings",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "email"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-sys-003",
    category: "system",
    type: "backup_complete",
    title: "Backup complete",
    body: "Nightly document + finance backup finished successfully.",
    priority: "low",
    alphTier: "informational",
    createdAt: T.yesterdayAm,
    readAt: T.yesterdayAm,
    entityRefs: [],
    actions: [
      {
        id: "open-settings",
        label: "Settings",
        kind: "navigate",
        href: "/settings",
        primary: true,
      },
      { id: "archive", label: "Archive", kind: "archive" },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-sys-004",
    category: "system",
    type: "api_error",
    title: "API error",
    body: "ELD provider returned 502 for 3 minutes — recovered.",
    priority: "medium",
    alphTier: "informational",
    createdAt: T.earlier,
    entityRefs: [],
    actions: [
      {
        id: "open-settings",
        label: "Integrations",
        kind: "navigate",
        href: "/settings",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app"],
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "notif-sys-005",
    category: "system",
    type: "integration_failed",
    title: "Integration failed",
    body: "Factoring sync failed overnight — payments may be delayed.",
    priority: "critical",
    alphTier: "immediate_action",
    createdAt: T.todayRecent,
    entityRefs: [],
    actions: [
      {
        id: "open-finance",
        label: "Open Finance",
        kind: "navigate",
        href: "/finance",
        primary: true,
      },
      {
        id: "open-settings",
        label: "Integrations",
        kind: "navigate",
        href: "/settings",
      },
    ],
    channels: ["in_app", "push", "email", "desktop"],
  },
];

function cloneSeed(): CarrierNotification[] {
  return notificationSeed.map((n) => ({
    ...n,
    entityRefs: [...n.entityRefs],
    actions: [...n.actions],
    channels: n.channels ? [...n.channels] : undefined,
  }));
}

function sortedSnapshot(items: CarrierNotification[]): CarrierNotification[] {
  return items
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

let store: CarrierNotification[] = cloneSeed();
let snapshot: CarrierNotification[] = sortedSnapshot(store);

let preferences: NotificationPreferences = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  channels: { ...DEFAULT_NOTIFICATION_PREFERENCES.channels },
};

const listeners = new Set<() => void>();

function emit(storeChanged = true) {
  if (storeChanged) {
    snapshot = sortedSnapshot(store);
  }
  for (const listener of listeners) listener();
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotificationsSnapshot(): CarrierNotification[] {
  return snapshot;
}

export function getNotificationPreferences(): NotificationPreferences {
  return preferences;
}

export function listNotifications(): CarrierNotification[] {
  return snapshot;
}

export function prependNotification(notification: CarrierNotification) {
  store = [notification, ...store.filter((n) => n.id !== notification.id)];
  emit();
}

export function markNotificationRead(id: string) {
  const now = new Date().toISOString();
  store = store.map((n) =>
    n.id === id && !n.readAt ? { ...n, readAt: now } : n,
  );
  emit();
}

export function markAllNotificationsRead() {
  const now = new Date().toISOString();
  store = store.map((n) =>
    n.readAt || n.dismissedAt || n.archivedAt ? n : { ...n, readAt: now },
  );
  emit();
}

export function dismissNotification(id: string) {
  const now = new Date().toISOString();
  store = store.map((n) =>
    n.id === id
      ? { ...n, dismissedAt: now, readAt: n.readAt ?? now }
      : n,
  );
  emit();
}

export function archiveNotification(id: string) {
  const now = new Date().toISOString();
  store = store.map((n) =>
    n.id === id
      ? { ...n, archivedAt: now, readAt: n.readAt ?? now }
      : n,
  );
  emit();
}

export function ignoreNotification(id: string) {
  dismissNotification(id);
}

export function updateNotificationPreferences(
  next: Partial<NotificationPreferences>,
) {
  preferences = {
    ...preferences,
    ...next,
    channels: {
      ...preferences.channels,
      ...(next.channels ?? {}),
    },
  };
  emit(false);
}

export function resetNotificationStoreForTests() {
  store = cloneSeed();
  preferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    channels: { ...DEFAULT_NOTIFICATION_PREFERENCES.channels },
  };
  emit();
}
