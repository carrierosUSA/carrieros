import type {
  PublicTrackingView,
  TrackingNovaEvent,
  TrackingRecord,
} from "@/lib/types";

export interface TrackingService {
  getTrackingForLoad(
    tenantId: string,
    loadId: string,
  ): Promise<PublicTrackingView | null>;
  getPublicTrackingByToken(token: string): Promise<PublicTrackingView | null>;
  getTrackingRecordForLoad(
    tenantId: string,
    loadId: string,
  ): Promise<TrackingRecord | null>;
  ensureTrackingForLoad(
    tenantId: string,
    loadId: string,
  ): Promise<TrackingRecord>;
  disableTracking(tenantId: string, loadId: string): Promise<TrackingRecord>;
  listNovaEvents(
    tenantId: string,
    loadId?: string,
  ): Promise<TrackingNovaEvent[]>;
}
