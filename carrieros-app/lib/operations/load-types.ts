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
  brokerProfileId?: string; brokerRelationshipStatus?: "active" | "review_required" | "do_not_use";
  driverDisplayName?: string;
  brokerContact?: string; commodity?: string; weightLbs?: number; equipmentType?: string;
  temperatureRequirement?: string; sealNumber?: string; deliveryNumber?: string;
  specialInstructions?: string; emergencyRequirements?: string;
  stops: LoadStopDetail[]; timeline: LoadTimelineEvent[];
};
export type AssignableDriver = { userId: string; displayName: string };
export type LinkableBroker = { id:string; legalName:string; mcNumber:string; relationshipStatus:"active"|"review_required"|"do_not_use" };
export type DetentionStop={stopId:string;stopSequence:number;stopType:string;facilityName?:string;appointmentAt?:string;arrivalAt?:string;departureAt?:string;freeTimeMinutes:number;waitMinutes?:number;potentialDetentionMinutes?:number;claimStatus:string;requestedAmountCents?:number;approvedAmountCents?:number;factualNote?:string};
export type ClosureDocumentCandidate = {
  id: string;
  title: string;
  documentType: "pod" | "invoice";
};
export type LoadClosureReadiness = {
  hasVerifiedPod: boolean;
  hasVerifiedInvoice: boolean;
  readyToClose: boolean;
};
export type LoadUpdateCapabilities = {
  canRecordFacts: boolean;
  canAssignLoad: boolean;
  allowedNextStatuses: LoadStatus[];
  closureRequiresDocuments: boolean;
  canManageClosure: boolean;
};
