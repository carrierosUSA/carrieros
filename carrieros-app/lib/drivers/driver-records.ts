import { driverNoteStore, driverViolationStore } from "@/lib/data/driver-store";

export function listDriverViolations(tenantId: string, driverId: string) {
  return driverViolationStore.filter(
    (entry) => entry.tenantId === tenantId && entry.driverId === driverId,
  );
}

export function listDriverNotes(tenantId: string, driverId: string) {
  return driverNoteStore
    .filter((entry) => entry.tenantId === tenantId && entry.driverId === driverId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
