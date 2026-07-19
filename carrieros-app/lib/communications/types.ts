export type CommunicationChannel = "voice" | "sms" | "email" | "chat";

export type CallDirection = "inbound" | "outbound";

export type EntityType =
  | "load"
  | "driver"
  | "truck"
  | "trailer"
  | "broker"
  | "company";

export type LinkedEntities = {
  loadId?: string;
  driverId?: string;
  truckId?: string;
  trailerId?: string;
  brokerId?: string;
  companyId?: string;
};

export type CommunicationParticipant = {
  name: string;
  phone?: string;
  email?: string;
  role?: string;
};

export type CommunicationMessage = {
  id: string;
  body: string;
  senderName: string;
  senderSide: "carrier" | "external" | "internal";
  sentAt: string;
};

export type CommunicationStatus =
  | "sent"
  | "received"
  | "missed"
  | "logged"
  | "completed";

export type ProviderKind = "mock" | "twilio" | "sendgrid";

export type CommunicationRecord = {
  id: string;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
  preview: string;
  participants: CommunicationParticipant[];
  linkedTo: LinkedEntities;
  direction?: CallDirection;
  durationSeconds?: number;
  status: CommunicationStatus;
  unread: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: CommunicationMessage[];
  notes?: string;
  provider: ProviderKind;
  chatRoom?: string;
};

export type CommunicationTimelineEvent = {
  id: string;
  communicationId: string;
  channel: CommunicationChannel;
  label: string;
  summary: string;
  linkedTo: LinkedEntities;
  occurredAt: string;
};

export type ComposeInput = {
  channel: CommunicationChannel;
  linkedTo: LinkedEntities;
  participants: CommunicationParticipant[];
  subject?: string;
  body: string;
  direction?: CallDirection;
  durationSeconds?: number;
  notes?: string;
  chatRoom?: string;
};

export type EntityOption = {
  type: EntityType;
  id: string;
  label: string;
  sublabel?: string;
  href: string;
};

export type CommunicationsFilter = {
  channel?: CommunicationChannel | "all";
  entityType?: EntityType | "all";
  unreadOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
  query?: string;
  loadId?: string;
  driverId?: string;
  truckId?: string;
  trailerId?: string;
  brokerId?: string;
  companyId?: string;
};

export type ProviderResult = {
  ok: boolean;
  provider: ProviderKind;
  externalId?: string;
  message: string;
  fallbackUrl?: string;
};
