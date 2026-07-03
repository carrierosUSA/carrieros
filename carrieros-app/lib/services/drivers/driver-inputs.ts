import type { DriverPayType, DriverStatus } from "@/lib/types";

export type CreateDriverInput = {
  name: string;
  email: string;
  role: string;
  status: DriverStatus;
  phone: string;
  location: string;
  hireDate: string;
  licenseClass: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiresAt: string;
  medicalExpiresAt: string;
  payRate: number;
  payType: DriverPayType;
  truckId?: string;
};

export type UpdateDriverInput = Partial<CreateDriverInput>;

export type AssignDriverInput = {
  truckId?: string;
};

export type CreateTimeOffInput = {
  startDate: string;
  endDate: string;
  reason: string;
};
