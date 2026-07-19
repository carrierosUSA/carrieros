export type {
  CallDirection,
  CommunicationChannel,
  CommunicationMessage,
  CommunicationParticipant,
  CommunicationRecord,
  CommunicationStatus,
  CommunicationsFilter,
  CommunicationTimelineEvent,
  ComposeInput,
  EntityOption,
  EntityType,
  LinkedEntities,
  ProviderKind,
  ProviderResult,
} from "@/lib/communications/types";

export {
  channelLabel,
  buildTimelineEvent,
  hasAnyLinkedEntity,
  countLinkedEntities,
} from "@/lib/communications/timeline";

export {
  mockProvider,
  twilioProvider,
  sendgridProvider,
  getActiveProvider,
  setActiveProvider,
  dispatchCompose,
} from "@/lib/communications/providers";
export type { CommunicationProvider } from "@/lib/communications/providers";

export {
  filterCommunications,
  filterTimelineEvents,
  countByChannel,
  countUnread,
  groupSmsThreads,
  groupChatRooms,
  listCallLog,
  listEmails,
} from "@/lib/communications/board";

export {
  entityHref,
  listEntityOptions,
  resolveLinkedEntityChips,
  applyEntityToLinked,
  removeEntityFromLinked,
  ENTITY_TYPE_LABELS,
} from "@/lib/communications/entities";

export {
  seedCommunications,
  listCommunications,
  listTimelineEvents,
  getCommunicationById,
  markCommunicationRead,
  appendMessageToThread,
  composeCommunication,
  resetCommunicationsStore,
} from "@/lib/communications/store";
