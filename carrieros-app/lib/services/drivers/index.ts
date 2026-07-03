import { mockDriverService } from "@/lib/services/drivers/driver-service.mock";
import type { DriverService } from "@/lib/services/drivers/driver-service";

export type {
  DriverService,
  DriverMetrics,
  DriverListFilters,
  CreateDriverInput,
  UpdateDriverInput,
  AssignDriverInput,
  CreateTimeOffInput,
} from "@/lib/services/drivers/driver-service";

export function getDriverService(): DriverService {
  return mockDriverService;
}
