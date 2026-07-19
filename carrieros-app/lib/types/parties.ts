import type { TenantEntity } from "@/lib/types/base";

export interface Customer extends TenantEntity {
  id: string;
  name: string;
  type: "shipper" | "consignee" | "both";
}

export type {
  Broker,
  BrokerStatus,
  BrokerPaymentMethod,
  BrokerContact,
  BrokerContactRole,
  BrokerDocument,
  BrokerDocumentType,
  BrokerDocumentStatus,
  BrokerRateHistoryEntry,
  BrokerNote,
  BrokerTimelineEvent,
} from "@/lib/types/broker";

export {
  BROKER_STATUSES,
  BROKER_STATUS_LABELS,
  BROKER_PAYMENT_METHODS,
  BROKER_PAYMENT_METHOD_LABELS,
  BROKER_CONTACT_ROLES,
  BROKER_CONTACT_ROLE_LABELS,
  BROKER_DOCUMENT_TYPES,
  BROKER_DOCUMENT_TYPE_LABELS,
} from "@/lib/types/broker";
