import type { LoadStatus } from "@/lib/types/load";

export type DispatchPriority = "green" | "amber" | "red";
export type DispatchBoardLoad = {
  id: string; createdAt: string; loadNumber: string; status: LoadStatus;
  pickupNumber?: string; brokerName?: string; origin?: string; destination?: string;
  nextStopType?: "pickup" | "delivery" | "stop"; nextAppointmentAt?: string;
  nextAppointmentTimezone?: string; driverUserId?: string; truckUnit?: string;
  trailerUnit?: string; currentLocation?: string; eta?: string; nextCheckAt?: string;
  priority: DispatchPriority; exceptionSummary?: string; rateCents?: number;
  currency?: string; miles?: number;
};
export type LoadStopDetail = {
  id: string; sequence: number; type: "pickup" | "delivery" | "stop";
  facilityName?: string; address: string; city: string; state: string;
  appointmentAt?: string; appointmentTimezone?: string; referenceNumber?: string;
  arrivedAt?: string; checkedInAt?: string; departedAt?: string;
};
export type LoadTimelineEvent = {
  id: string; type: string; status?: string; location?: string; eta?: string;
  note?: string; source: string; eventAt: string;
};
export type LoadDetail = DispatchBoardLoad & {
  brokerContact?: string; commodity?: string; weightLbs?: number; equipmentType?: string;
  temperatureRequirement?: string; sealNumber?: string; deliveryNumber?: string;
  specialInstructions?: string; emergencyRequirements?: string;
  stops: LoadStopDetail[]; timeline: LoadTimelineEvent[];
};
export type LoadUpdateCapabilities = {
  canRecordFacts: boolean;
  allowedNextStatuses: LoadStatus[];
  closureRequiresDocuments: boolean;
};
