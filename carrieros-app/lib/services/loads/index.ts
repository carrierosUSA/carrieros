import { mockLoadService } from "@/lib/services/loads/load-service.mock";
import type { LoadService } from "@/lib/services/loads/load-service";

export type {
  LoadListFilters,
  LoadService,
  CreateLoadInput,
  UpdateLoadInput,
  AssignDriverInput,
  AssignTruckInput,
  LoadStopInput,
} from "@/lib/services/loads/load-service";

export function getLoadService(): LoadService {
  return mockLoadService;
}
