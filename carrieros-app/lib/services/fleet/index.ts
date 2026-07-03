import { mockFleetService } from "@/lib/services/fleet/fleet-service.mock";
import type { FleetService } from "@/lib/services/fleet/fleet-service";

export type {
  FleetMetrics,
  FleetService,
  CreateTruckInput,
  UpdateTruckInput,
  CreateTrailerInput,
  UpdateTrailerInput,
} from "@/lib/services/fleet/fleet-service";

export function getFleetService(): FleetService {
  return mockFleetService;
}
