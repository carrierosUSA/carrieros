import {
  driverDocumentStore,
  driverLicenseStore,
  driverMedicalStore,
  driverPayrollStore,
  driverPerformanceStore,
  driverSafetyStore,
  driverStore,
  driverTimelineStore,
  driverTimeOffStore,
} from "@/lib/data/driver-store";
import { getTruckById } from "@/lib/data/fleet-store";
import {
  buildNovaInsights,
  buildNovaSummary,
  nextDriverId,
} from "@/lib/services/drivers/driver-helpers";
import type {
  AssignDriverInput,
  CreateDriverInput,
  CreateTimeOffInput,
  UpdateDriverInput,
} from "@/lib/services/drivers/driver-inputs";
import type {
  DriverListFilters,
  DriverMetrics,
  DriverService,
} from "@/lib/services/drivers/driver-service";
import type { Driver, DriverStatus, DriverTimelineEvent } from "@/lib/types";

function getTenantDriver(tenantId: string, driverId: string) {
  return driverStore.find(
    (driver) => driver.tenantId === tenantId && driver.id === driverId,
  );
}

function filterDrivers(tenantId: string, filters: DriverListFilters = {}) {
  let result = driverStore.filter((driver) => driver.tenantId === tenantId);

  if (filters.status && filters.status !== "all") {
    result = result.filter((driver) => driver.status === filters.status);
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((driver) =>
      [driver.name, driver.email, driver.role, driver.location, driver.phone]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function appendTimelineEvent(
  tenantId: string,
  driverId: string,
  label: string,
  category: DriverTimelineEvent["category"],
) {
  driverTimelineStore.unshift({
    tenantId,
    id: `timeline-${driverId}-${Date.now()}`,
    driverId,
    label,
    occurredAt: new Date().toISOString(),
    category,
  });
}

function syncLicenseRecord(driver: Driver) {
  const existing = driverLicenseStore.find(
    (record) => record.driverId === driver.id && record.tenantId === driver.tenantId,
  );

  const payload = {
    tenantId: driver.tenantId,
    driverId: driver.id,
    class: driver.licenseClass,
    number: driver.licenseNumber,
    state: driver.licenseState,
    expiresAt: driver.licenseExpiresAt,
    status:
      new Date(driver.licenseExpiresAt) <= new Date()
        ? ("expired" as const)
        : new Date(driver.licenseExpiresAt) <= new Date(Date.now() + 90 * 86400000)
          ? ("expiring" as const)
          : ("valid" as const),
  };

  if (existing) {
    Object.assign(existing, payload);
  } else {
    driverLicenseStore.unshift({
      id: `license-${driver.id}`,
      ...payload,
    });
  }
}

function syncMedicalRecord(driver: Driver) {
  const existing = driverMedicalStore.find(
    (record) => record.driverId === driver.id && record.tenantId === driver.tenantId,
  );

  const payload = {
    tenantId: driver.tenantId,
    driverId: driver.id,
    expiresAt: driver.medicalExpiresAt,
    cardNumber: `MC-${driver.id.toUpperCase()}`,
    status:
      new Date(driver.medicalExpiresAt) <= new Date()
        ? ("expired" as const)
        : new Date(driver.medicalExpiresAt) <= new Date(Date.now() + 90 * 86400000)
          ? ("expiring" as const)
          : ("valid" as const),
  };

  if (existing) {
    Object.assign(existing, payload);
  } else {
    driverMedicalStore.unshift({
      id: `medical-${driver.id}`,
      ...payload,
    });
  }
}

export const mockDriverService: DriverService = {
  async listDrivers(tenantId, filters = {}) {
    return filterDrivers(tenantId, filters);
  },

  async getDriver(tenantId, driverId) {
    return getTenantDriver(tenantId, driverId) ?? null;
  },

  async createDriver(tenantId, input: CreateDriverInput) {
    const now = new Date().toISOString();
    const driver: Driver = {
      tenantId,
      id: nextDriverId(input.name),
      ...input,
      novaSummary: "",
      createdAt: now,
      updatedAt: now,
    };

    driver.novaSummary = buildNovaSummary(driver);
    driverStore.unshift(driver);
    syncLicenseRecord(driver);
    syncMedicalRecord(driver);
    appendTimelineEvent(tenantId, driver.id, "Driver hired", "hire");

    if (driver.truckId) {
      appendTimelineEvent(
        tenantId,
        driver.id,
        `Assigned to ${getTruckById(driver.truckId) ? `Unit ${getTruckById(driver.truckId)?.unitNumber}` : "truck"}`,
        "assignment",
      );
    }

    return driver;
  },

  async updateDriver(tenantId, driverId, input: UpdateDriverInput) {
    const driver = getTenantDriver(tenantId, driverId);

    if (!driver) {
      throw new Error("Driver not found.");
    }

    Object.assign(driver, input, {
      updatedAt: new Date().toISOString(),
    });
    driver.novaSummary = buildNovaSummary(driver);
    syncLicenseRecord(driver);
    syncMedicalRecord(driver);

    return driver;
  },

  async deleteDriver(tenantId, driverId) {
    const index = driverStore.findIndex(
      (driver) => driver.tenantId === tenantId && driver.id === driverId,
    );

    if (index === -1) {
      throw new Error("Driver not found.");
    }

    driverStore.splice(index, 1);
  },

  async assignDriver(tenantId, driverId, input: AssignDriverInput) {
    const driver = getTenantDriver(tenantId, driverId);

    if (!driver) {
      throw new Error("Driver not found.");
    }

    driver.truckId = input.truckId;
    driver.updatedAt = new Date().toISOString();
    driver.novaSummary = buildNovaSummary(driver);

    if (input.truckId) {
      const truck = getTruckById(input.truckId);
      appendTimelineEvent(
        tenantId,
        driverId,
        `Assigned to ${truck ? `Unit ${truck.unitNumber}` : "truck"}`,
        "assignment",
      );
    } else {
      appendTimelineEvent(tenantId, driverId, "Truck assignment removed", "assignment");
    }

    return driver;
  },

  async getDriverMetrics(tenantId): Promise<DriverMetrics> {
    const drivers = driverStore.filter((driver) => driver.tenantId === tenantId);
    const licenses = driverLicenseStore.filter((record) => record.tenantId === tenantId);
    const medical = driverMedicalStore.filter((record) => record.tenantId === tenantId);
    const safety = driverSafetyStore.filter((record) => record.tenantId === tenantId);
    const timeOff = driverTimeOffStore.filter((record) => record.tenantId === tenantId);

    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter((driver) => driver.status === "active").length,
      onboardingDrivers: drivers.filter((driver) => driver.status === "onboarding").length,
      expiringCompliance: [...licenses, ...medical].filter(
        (record) => record.status === "expiring" || record.status === "expired",
      ).length,
      openSafetyEvents: safety.filter((event) => event.status === "open").length,
      pendingTimeOff: timeOff.filter((entry) => entry.status === "pending").length,
    };
  },

  async listLicenses(tenantId, driverId) {
    return driverLicenseStore.filter(
      (record) =>
        record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
    );
  },

  async listMedicalCards(tenantId, driverId) {
    return driverMedicalStore.filter(
      (record) =>
        record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
    );
  },

  async listPayroll(tenantId, driverId) {
    return driverPayrollStore.filter(
      (record) =>
        record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
    );
  },

  async listPerformance(tenantId, driverId) {
    return driverPerformanceStore.filter(
      (record) =>
        record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
    );
  },

  async listSafetyEvents(tenantId, driverId) {
    return driverSafetyStore
      .filter(
        (record) =>
          record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
      )
      .sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      );
  },

  async listTimeline(tenantId, driverId) {
    return driverTimelineStore
      .filter((record) => record.tenantId === tenantId && record.driverId === driverId)
      .sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      );
  },

  async listDocuments(tenantId, driverId) {
    return driverDocumentStore.filter(
      (record) =>
        record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
    );
  },

  async listTimeOff(tenantId, driverId) {
    return driverTimeOffStore.filter(
      (record) =>
        record.tenantId === tenantId && (driverId ? record.driverId === driverId : true),
    );
  },

  async createTimeOff(tenantId, driverId, input: CreateTimeOffInput) {
    const driver = getTenantDriver(tenantId, driverId);

    if (!driver) {
      throw new Error("Driver not found.");
    }

    const entry = {
      tenantId,
      id: `timeoff-${driverId}-${Date.now()}`,
      driverId,
      ...input,
      status: "pending" as const,
    };

    driverTimeOffStore.unshift(entry);
    appendTimelineEvent(tenantId, driverId, "Time off request submitted", "compliance");
    return entry;
  },

  async getNovaInsights(tenantId, driverId) {
    const driver = getTenantDriver(tenantId, driverId);
    return driver ? buildNovaInsights(driver) : [];
  },

  async countByStatus(tenantId) {
    const drivers = driverStore.filter((driver) => driver.tenantId === tenantId);
    const counts: Record<DriverStatus | "all", number> = {
      all: drivers.length,
      active: 0,
      inactive: 0,
      onboarding: 0,
      terminated: 0,
    };

    for (const driver of drivers) {
      counts[driver.status] += 1;
    }

    return counts;
  },
};
