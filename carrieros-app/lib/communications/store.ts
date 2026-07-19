import { buildTimelineEvent } from "@/lib/communications/timeline";
import { dispatchCompose } from "@/lib/communications/providers";
import type {
  CommunicationMessage,
  CommunicationRecord,
  CommunicationTimelineEvent,
  ComposeInput,
} from "@/lib/communications/types";

/**
 * Seed clock aligned with demo data (Fri Jul 17, 2026).
 */
const T = {
  now: "2026-07-17T16:40:00Z",
  todayAm: "2026-07-17T08:15:00Z",
  todayMid: "2026-07-17T11:22:00Z",
  todayPm: "2026-07-17T14:05:00Z",
  todayRecent: "2026-07-17T15:48:00Z",
  yesterdayAm: "2026-07-16T09:30:00Z",
  yesterdayPm: "2026-07-16T17:10:00Z",
  wed: "2026-07-15T13:40:00Z",
  tue: "2026-07-14T10:20:00Z",
  mon: "2026-07-13T16:00:00Z",
  lastWeek: "2026-07-10T11:00:00Z",
} as const;

function preview(text: string, max = 96): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function msg(
  id: string,
  body: string,
  senderName: string,
  senderSide: CommunicationMessage["senderSide"],
  sentAt: string,
): CommunicationMessage {
  return { id, body, senderName, senderSide, sentAt };
}

export const seedCommunications: CommunicationRecord[] = [
  {
    id: "comm-voice-001",
    channel: "voice",
    body: "Confirmed pickup window and gate code.",
    preview: "Confirmed pickup window and gate code.",
    participants: [
      { name: "Onkar Singh", phone: "210-555-0001", role: "Driver" },
    ],
    linkedTo: {
      loadId: "load-24003",
      driverId: "onkar-singh",
      truckId: "truck-102",
    },
    direction: "outbound",
    durationSeconds: 247,
    status: "completed",
    unread: false,
    createdAt: T.todayRecent,
    updatedAt: T.todayRecent,
    notes: "Driver ETA solid. Asked for shipper appointment confirmation.",
    provider: "mock",
  },
  {
    id: "comm-voice-002",
    channel: "voice",
    body: "Missed call from broker about detention.",
    preview: "Missed call from broker about detention.",
    participants: [
      { name: "James Kline", phone: "713-555-2201", role: "Broker dispatcher" },
    ],
    linkedTo: {
      loadId: "load-24001",
      brokerId: "broker-freightline",
      companyId: "company-freightline",
    },
    direction: "inbound",
    durationSeconds: 0,
    status: "missed",
    unread: true,
    createdAt: T.todayPm,
    updatedAt: T.todayPm,
    notes: "Callback needed — detention claim on Dallas pickup.",
    provider: "mock",
  },
  {
    id: "comm-voice-003",
    channel: "voice",
    body: "Shop called about DEF sensor on Unit 104.",
    preview: "Shop called about DEF sensor on Unit 104.",
    participants: [
      { name: "Fleet Shop Desk", phone: "210-555-8800", role: "Maintenance" },
    ],
    linkedTo: { truckId: "truck-104" },
    direction: "inbound",
    durationSeconds: 312,
    status: "completed",
    unread: false,
    createdAt: T.yesterdayAm,
    updatedAt: T.yesterdayAm,
    notes: "Parts ordered. ETA tomorrow morning.",
    provider: "mock",
  },
  {
    id: "comm-voice-004",
    channel: "voice",
    body: "Safety follow-up on roadside inspection.",
    preview: "Safety follow-up on roadside inspection.",
    participants: [
      { name: "Carlos Mendez", phone: "512-555-0044", role: "Driver" },
    ],
    linkedTo: { driverId: "carlos-mendez", trailerId: "trailer-2204" },
    direction: "outbound",
    durationSeconds: 418,
    status: "completed",
    unread: false,
    createdAt: T.wed,
    updatedAt: T.wed,
    notes: "Clean inspection. Logbook photos requested.",
    provider: "mock",
  },
  {
    id: "comm-sms-001",
    channel: "sms",
    body: "ETA updated — 45 min out from shipper.",
    preview: "ETA updated — 45 min out from shipper.",
    participants: [
      { name: "Onkar Singh", phone: "210-555-0001", role: "Driver" },
    ],
    linkedTo: {
      loadId: "load-24003",
      driverId: "onkar-singh",
      truckId: "truck-102",
    },
    status: "received",
    unread: true,
    createdAt: T.todayMid,
    updatedAt: T.todayRecent,
    provider: "mock",
    messages: [
      msg(
        "sms-001-a",
        "Checking in — cleared scale, rolling to shipper.",
        "Onkar Singh",
        "external",
        T.todayAm,
      ),
      msg(
        "sms-001-b",
        "Copy. Confirm appointment and send gate photo when you arrive.",
        "Dispatch",
        "carrier",
        "2026-07-17T08:22:00Z",
      ),
      msg(
        "sms-001-c",
        "ETA updated — 45 min out from shipper.",
        "Onkar Singh",
        "external",
        T.todayMid,
      ),
    ],
  },
  {
    id: "comm-sms-002",
    channel: "sms",
    body: "Rate con signed. Sending POD checklist.",
    preview: "Rate con signed. Sending POD checklist.",
    participants: [
      { name: "Sarah Mitchell", phone: "214-555-3310", role: "Broker" },
    ],
    linkedTo: {
      loadId: "load-24002",
      brokerId: "broker-capital",
      driverId: "onkar-singh",
    },
    status: "sent",
    unread: false,
    createdAt: T.yesterdayPm,
    updatedAt: T.yesterdayPm,
    provider: "mock",
    messages: [
      msg(
        "sms-002-a",
        "Can you confirm driver for SA → Houston today?",
        "Sarah Mitchell",
        "external",
        "2026-07-16T16:40:00Z",
      ),
      msg(
        "sms-002-b",
        "Yes — Onkar on Unit 102. Rate con signed. Sending POD checklist.",
        "Dispatch",
        "carrier",
        T.yesterdayPm,
      ),
    ],
  },
  {
    id: "comm-sms-003",
    channel: "sms",
    body: "Reefer set to 34° — fuel at 28%.",
    preview: "Reefer set to 34° — fuel at 28%.",
    participants: [
      { name: "Aman Singh", phone: "210-555-0003", role: "Driver" },
    ],
    linkedTo: {
      driverId: "marcus-reed",
      trailerId: "trailer-2204",
      truckId: "truck-107",
    },
    status: "received",
    unread: false,
    createdAt: T.tue,
    updatedAt: T.tue,
    provider: "mock",
    messages: [
      msg(
        "sms-003-a",
        "Pre-trip done. Reefer set to 34° — fuel at 28%.",
        "Aman Singh",
        "external",
        T.tue,
      ),
      msg(
        "sms-003-b",
        "Thanks — top off reefer fuel before departure.",
        "Dispatch",
        "carrier",
        "2026-07-14T10:35:00Z",
      ),
    ],
  },
  {
    id: "comm-sms-004",
    channel: "sms",
    body: "Need empty trailer T-2201 dropped at yard.",
    preview: "Need empty trailer T-2201 dropped at yard.",
    participants: [
      { name: "Yard Ops", phone: "210-555-0199", role: "Yard" },
    ],
    linkedTo: { trailerId: "trailer-2201", truckId: "truck-102" },
    status: "sent",
    unread: false,
    createdAt: T.mon,
    updatedAt: T.mon,
    provider: "mock",
    messages: [
      msg(
        "sms-004-a",
        "Need empty trailer T-2201 dropped at yard by 6pm.",
        "Dispatch",
        "carrier",
        T.mon,
      ),
      msg(
        "sms-004-b",
        "Scheduled. Bay 3.",
        "Yard Ops",
        "external",
        "2026-07-13T16:20:00Z",
      ),
    ],
  },
  {
    id: "comm-email-001",
    channel: "email",
    subject: "POD request — LD-24004",
    body: "Hello,\n\nPlease send the signed POD for LD-24004 El Paso → Albuquerque at your earliest convenience.\n\nThank you.",
    preview: "Please send the signed POD for LD-24004…",
    participants: [
      {
        name: "Priya Patel",
        email: "priya.patel@freightline.example",
        role: "Accounting",
      },
    ],
    linkedTo: {
      loadId: "load-24004",
      brokerId: "broker-freightline",
      companyId: "company-freightline",
    },
    status: "sent",
    unread: false,
    createdAt: T.todayAm,
    updatedAt: T.todayAm,
    provider: "mock",
  },
  {
    id: "comm-email-002",
    channel: "email",
    subject: "Invoice follow-up — Capital Freight",
    body: "Hi Tom,\n\nFollowing up on unpaid invoices past terms. Please confirm payment status for the June packet.\n\nRegards,\nAccounting",
    preview: "Following up on unpaid invoices past terms…",
    participants: [
      {
        name: "Tom Bradley",
        email: "tom.bradley@capitalfreight.example",
        role: "Broker AP",
      },
    ],
    linkedTo: {
      brokerId: "broker-capital",
      companyId: "company-capital",
    },
    status: "sent",
    unread: false,
    createdAt: T.yesterdayAm,
    updatedAt: T.yesterdayAm,
    provider: "mock",
  },
  {
    id: "comm-email-003",
    channel: "email",
    subject: "Re: Rate confirmation LD-24001",
    body: "Attached is the countersigned rate confirmation for Dallas → Phoenix. Please assign and confirm.\n\n— James Kline",
    preview: "Attached is the countersigned rate confirmation…",
    participants: [
      {
        name: "James Kline",
        email: "james.kline@freightline.example",
        role: "Broker dispatcher",
      },
    ],
    linkedTo: {
      loadId: "load-24001",
      brokerId: "broker-freightline",
    },
    status: "received",
    unread: true,
    createdAt: T.todayPm,
    updatedAt: T.todayPm,
    provider: "mock",
  },
  {
    id: "comm-email-004",
    channel: "email",
    subject: "Medical card renewal reminder",
    body: "Hi Carlos,\n\nYour medical card renews soon. Please upload the new card in the driver app.\n\n— Safety",
    preview: "Your medical card renews soon…",
    participants: [
      {
        name: "Carlos Mendez",
        email: "carlos.mendez@demo-carrier.com",
        role: "Driver",
      },
    ],
    linkedTo: { driverId: "carlos-mendez" },
    status: "sent",
    unread: false,
    createdAt: T.lastWeek,
    updatedAt: T.lastWeek,
    provider: "mock",
  },
  {
    id: "comm-chat-001",
    channel: "chat",
    body: "Detention starting on LD-24001 — notify broker?",
    preview: "Detention starting on LD-24001 — notify broker?",
    participants: [
      { name: "Maya Chen", role: "Dispatch" },
      { name: "Elena Ruiz", role: "Safety" },
    ],
    linkedTo: {
      loadId: "load-24001",
      brokerId: "broker-freightline",
      driverId: "onkar-singh",
    },
    status: "received",
    unread: true,
    createdAt: T.todayMid,
    updatedAt: T.todayRecent,
    chatRoom: "Dispatch ↔ Safety",
    provider: "mock",
    messages: [
      msg(
        "chat-001-a",
        "Detention starting on LD-24001 — notify broker?",
        "Maya Chen",
        "internal",
        T.todayMid,
      ),
      msg(
        "chat-001-b",
        "Yes — log hours and ping James. I'll note the claim.",
        "Elena Ruiz",
        "internal",
        "2026-07-17T11:40:00Z",
      ),
      msg(
        "chat-001-c",
        "Called — no answer. Left voicemail. Thread in Call Log.",
        "Maya Chen",
        "internal",
        T.todayPm,
      ),
    ],
  },
  {
    id: "comm-chat-002",
    channel: "chat",
    body: "Payroll cut-off Thursday — missing miles for Aman?",
    preview: "Payroll cut-off Thursday — missing miles for Aman?",
    participants: [
      { name: "Lovepreet Kaur", role: "Ops" },
      { name: "Accounting Desk", role: "Accounting" },
    ],
    linkedTo: { driverId: "marcus-reed", truckId: "truck-107" },
    status: "sent",
    unread: false,
    createdAt: T.yesterdayPm,
    updatedAt: T.yesterdayPm,
    chatRoom: "Dispatch ↔ Accounting",
    provider: "mock",
    messages: [
      msg(
        "chat-002-a",
        "Payroll cut-off Thursday — missing miles for Aman?",
        "Accounting Desk",
        "internal",
        "2026-07-16T16:50:00Z",
      ),
      msg(
        "chat-002-b",
        "I'll pull ELD and confirm by EOD.",
        "Lovepreet Kaur",
        "internal",
        T.yesterdayPm,
      ),
    ],
  },
  {
    id: "comm-chat-003",
    channel: "chat",
    body: "Unit 112 PM due — pull from marketplace?",
    preview: "Unit 112 PM due — pull from marketplace?",
    participants: [
      { name: "Fleet Manager", role: "Fleet" },
      { name: "Dispatch Board", role: "Dispatch" },
    ],
    linkedTo: { truckId: "truck-112" },
    status: "received",
    unread: false,
    createdAt: T.wed,
    updatedAt: T.wed,
    chatRoom: "Fleet ↔ Dispatch",
    provider: "mock",
    messages: [
      msg(
        "chat-003-a",
        "Unit 112 PM due Friday. Can we keep it off load?",
        "Fleet Manager",
        "internal",
        T.wed,
      ),
      msg(
        "chat-003-b",
        "Yes — holding. Use 110 as backup.",
        "Dispatch Board",
        "internal",
        "2026-07-15T14:05:00Z",
      ),
    ],
  },
  {
    id: "comm-voice-005",
    channel: "voice",
    body: "Quick check with Lovepreet on board coverage.",
    preview: "Quick check with Lovepreet on board coverage.",
    participants: [
      { name: "Lovepreet Kaur", phone: "210-555-0002", role: "Ops" },
    ],
    linkedTo: { driverId: "lovepreet-kaur" },
    direction: "outbound",
    durationSeconds: 95,
    status: "logged",
    unread: false,
    createdAt: T.todayAm,
    updatedAt: T.todayAm,
    notes: "Covering afternoon board.",
    provider: "mock",
  },
  {
    id: "comm-sms-005",
    channel: "sms",
    body: "Load LD-24002 delivered — waiting on POD photo.",
    preview: "Load LD-24002 delivered — waiting on POD photo.",
    participants: [
      { name: "Onkar Singh", phone: "210-555-0001", role: "Driver" },
    ],
    linkedTo: {
      loadId: "load-24002",
      driverId: "onkar-singh",
      truckId: "truck-102",
      brokerId: "broker-capital",
    },
    status: "sent",
    unread: false,
    createdAt: T.yesterdayAm,
    updatedAt: T.yesterdayAm,
    provider: "mock",
    messages: [
      msg(
        "sms-005-a",
        "Load LD-24002 delivered — waiting on POD photo.",
        "Dispatch",
        "carrier",
        T.yesterdayAm,
      ),
      msg(
        "sms-005-b",
        "Uploading now.",
        "Onkar Singh",
        "external",
        "2026-07-16T09:55:00Z",
      ),
    ],
  },
  {
    id: "comm-email-005",
    channel: "email",
    subject: "Insurance requirements — FreightLine",
    body: "Hello Elena,\n\nPlease confirm cargo limits for Q3. Attaching our current COI request.\n\n— Safety",
    preview: "Please confirm cargo limits for Q3…",
    participants: [
      {
        name: "Elena Ruiz",
        email: "elena.ruiz@freightline.example",
        role: "Broker safety",
      },
    ],
    linkedTo: {
      brokerId: "broker-freightline",
      companyId: "company-freightline",
    },
    status: "sent",
    unread: false,
    createdAt: T.tue,
    updatedAt: T.tue,
    provider: "mock",
  },
  {
    id: "comm-chat-004",
    channel: "chat",
    body: "Customer portal user asking for tracking link.",
    preview: "Customer portal user asking for tracking link.",
    participants: [
      { name: "Portal Support", role: "Support" },
      { name: "Maya Chen", role: "Dispatch" },
    ],
    linkedTo: {
      loadId: "load-24003",
      companyId: "company-freightline",
    },
    status: "received",
    unread: true,
    createdAt: T.todayRecent,
    updatedAt: T.todayRecent,
    chatRoom: "Support ↔ Dispatch",
    provider: "mock",
    messages: [
      msg(
        "chat-004-a",
        "Customer portal user asking for tracking link on LD-24003.",
        "Portal Support",
        "internal",
        T.todayRecent,
      ),
    ],
  },
  {
    id: "comm-voice-006",
    channel: "voice",
    body: "Broker confirmed lumper reimbursement.",
    preview: "Broker confirmed lumper reimbursement.",
    participants: [
      { name: "Night Desk", phone: "713-555-2299", role: "After hours" },
    ],
    linkedTo: {
      loadId: "load-24004",
      brokerId: "broker-freightline",
    },
    direction: "inbound",
    durationSeconds: 180,
    status: "completed",
    unread: false,
    createdAt: T.lastWeek,
    updatedAt: T.lastWeek,
    notes: "$150 lumper approved. Receipt in documents.",
    provider: "mock",
  },
];

let communicationsStore: CommunicationRecord[] = seedCommunications.map(
  (r) => ({
    ...r,
    linkedTo: { ...r.linkedTo },
    participants: r.participants.map((p) => ({ ...p })),
    messages: r.messages?.map((m) => ({ ...m })),
  }),
);

let timelineStore: CommunicationTimelineEvent[] = seedCommunications.map(
  (r) => buildTimelineEvent(r),
);

export function listCommunications(): CommunicationRecord[] {
  return communicationsStore.map((r) => ({
    ...r,
    linkedTo: { ...r.linkedTo },
    participants: r.participants.map((p) => ({ ...p })),
    messages: r.messages?.map((m) => ({ ...m })),
  }));
}

export function listTimelineEvents(): CommunicationTimelineEvent[] {
  return timelineStore.map((e) => ({
    ...e,
    linkedTo: { ...e.linkedTo },
  }));
}

export function getCommunicationById(
  id: string,
): CommunicationRecord | undefined {
  return listCommunications().find((r) => r.id === id);
}

export function markCommunicationRead(id: string): void {
  communicationsStore = communicationsStore.map((r) =>
    r.id === id ? { ...r, unread: false, updatedAt: new Date().toISOString() } : r,
  );
}

export function appendMessageToThread(
  id: string,
  body: string,
  senderName = "Dispatch",
): CommunicationRecord | null {
  const now = new Date().toISOString();
  let updated: CommunicationRecord | null = null;

  communicationsStore = communicationsStore.map((r) => {
    if (r.id !== id) return r;
    const message: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      body,
      senderName,
      senderSide: "carrier",
      sentAt: now,
    };
    updated = {
      ...r,
      body,
      preview: preview(body),
      unread: false,
      status: "sent",
      updatedAt: now,
      messages: [...(r.messages ?? []), message],
    };
    return updated;
  });

  if (updated) {
    timelineStore = [buildTimelineEvent(updated, now), ...timelineStore];
  }

  return updated;
}

export async function composeCommunication(
  input: ComposeInput,
): Promise<{
  record: CommunicationRecord;
  providerMessage: string;
  fallbackUrl?: string;
}> {
  const result = await dispatchCompose(input);
  const now = new Date().toISOString();
  const id = `comm-${input.channel}-${Date.now()}`;

  const record: CommunicationRecord = {
    id,
    channel: input.channel,
    subject: input.subject,
    body: input.body,
    preview: preview(input.body || input.subject || "Communication logged"),
    participants: input.participants,
    linkedTo: { ...input.linkedTo },
    direction: input.direction ?? (input.channel === "voice" ? "outbound" : undefined),
    durationSeconds: input.durationSeconds,
    status:
      input.channel === "voice"
        ? "logged"
        : input.channel === "chat"
          ? "sent"
          : "sent",
    unread: false,
    createdAt: now,
    updatedAt: now,
    notes: input.notes,
    chatRoom: input.chatRoom,
    provider: result.provider,
    messages:
      input.channel === "sms" || input.channel === "chat"
        ? [
            {
              id: `msg-${Date.now()}`,
              body: input.body,
              senderName: "Dispatch",
              senderSide: input.channel === "chat" ? "internal" : "carrier",
              sentAt: now,
            },
          ]
        : undefined,
  };

  communicationsStore = [record, ...communicationsStore];
  timelineStore = [buildTimelineEvent(record, now), ...timelineStore];

  return {
    record,
    providerMessage: result.message,
    fallbackUrl: result.fallbackUrl,
  };
}

export function resetCommunicationsStore(): void {
  communicationsStore = seedCommunications.map((r) => ({
    ...r,
    linkedTo: { ...r.linkedTo },
    participants: r.participants.map((p) => ({ ...p })),
    messages: r.messages?.map((m) => ({ ...m })),
  }));
  timelineStore = seedCommunications.map((r) => buildTimelineEvent(r));
}
