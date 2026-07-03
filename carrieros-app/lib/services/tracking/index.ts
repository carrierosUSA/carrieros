import { mockTrackingService } from "@/lib/services/tracking/tracking-service.mock";
import type { TrackingService } from "@/lib/services/tracking/tracking-service";

export type { TrackingService } from "@/lib/services/tracking/tracking-service";

export function getTrackingService(): TrackingService {
  return mockTrackingService;
}
