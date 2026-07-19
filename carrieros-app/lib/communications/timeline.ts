import type {
  CommunicationChannel,
  CommunicationRecord,
  CommunicationTimelineEvent,
  LinkedEntities,
} from "@/lib/communications/types";

const CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  voice: "Voice call",
  sms: "SMS",
  email: "Email",
  chat: "Internal chat",
};

export function channelLabel(channel: CommunicationChannel): string {
  return CHANNEL_LABELS[channel];
}

export function buildTimelineEvent(
  record: CommunicationRecord,
  occurredAt?: string,
): CommunicationTimelineEvent {
  const who =
    record.participants.map((p) => p.name).filter(Boolean).join(", ") ||
    "Unknown";

  let label = CHANNEL_LABELS[record.channel];
  let summary = record.preview;

  if (record.channel === "voice") {
    const dir = record.direction === "inbound" ? "Inbound" : "Outbound";
    label = `${dir} call`;
    const mins =
      record.durationSeconds != null
        ? `${Math.floor(record.durationSeconds / 60)}m ${record.durationSeconds % 60}s`
        : null;
    summary = mins ? `${who} · ${mins}` : who;
  } else if (record.channel === "sms") {
    label = "SMS sent";
    if (record.status === "received") label = "SMS received";
    summary = `${who}: ${record.preview}`;
  } else if (record.channel === "email") {
    label = record.subject ? `Email — ${record.subject}` : "Email";
    summary = `${who}: ${record.preview}`;
  } else {
    label = record.chatRoom
      ? `Chat · ${record.chatRoom}`
      : "Internal chat";
    summary = `${who}: ${record.preview}`;
  }

  return {
    id: `tl-${record.id}`,
    communicationId: record.id,
    channel: record.channel,
    label,
    summary,
    linkedTo: { ...record.linkedTo },
    occurredAt: occurredAt ?? record.createdAt,
  };
}

export function hasAnyLinkedEntity(linkedTo: LinkedEntities): boolean {
  return Boolean(
    linkedTo.loadId ||
      linkedTo.driverId ||
      linkedTo.truckId ||
      linkedTo.trailerId ||
      linkedTo.brokerId ||
      linkedTo.companyId,
  );
}

export function countLinkedEntities(linkedTo: LinkedEntities): number {
  return [
    linkedTo.loadId,
    linkedTo.driverId,
    linkedTo.truckId,
    linkedTo.trailerId,
    linkedTo.brokerId,
    linkedTo.companyId,
  ].filter(Boolean).length;
}
