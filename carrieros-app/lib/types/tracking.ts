import type { TenantEntity } from "@/lib/types/base";
import type { DriverLocation } from "@/lib/types/driver";
import type { LoadStatus, LoadStop } from "@/lib/types/load";

export type TrackingStatus =
  | "live"
  | "disabled"
  | "expired_delivered"
  | "not_ready";

export type TrackingNovaEventType =
  | "broker_opened"
  | "tracking_expired"
  | "truck_stopped"
  | "eta_changed";

export interface TrackingRecord extends TenantEntity {
  id: string;
  loadId: string;
  token: string;
  enabled: boolean;
  createdAt: string;
  disabledAt?: string;
  lastOpenedAt?: string;
  lastEtaMinutes?: number;
}

export interface TrackingNovaEvent extends TenantEntity {
  id: string;
  loadId: string;
  type: TrackingNovaEventType;
  message: string;
  createdAt: string;
}

export interface PublicLoadSummary {
  id: string;
  reference: string;
  status: LoadStatus;
  origin: LoadStop;
  destination: LoadStop;
}

export interface PublicTrackingView {
  companyName: string;
  load: PublicLoadSummary;
  token: string;
  status: TrackingStatus;
  location?: DriverLocation;
  etaMinutes?: number;
  etaLabel: string;
  pickupCompleted: boolean;
  currentStop: string;
  deliveryCountdown: string;
  driverFirstName?: string;
  trailerNumber?: string;
  temperature?: string;
  lastUpdatedAt: string;
  novaEvents: TrackingNovaEvent[];
  finalPodStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
}
