/**
 * Future hook points for OEM telematics, fleet platforms, and repair shops.
 * No live API calls — structured for provider adapters.
 */

export type MaintenanceIntegrationKind =
  | "telematics"
  | "oem"
  | "reefer"
  | "repair_shop";

export type MaintenanceIntegrationProvider =
  | "samsara"
  | "motive"
  | "geotab"
  | "omnitracs"
  | "detroit"
  | "cummins"
  | "paccar"
  | "volvo"
  | "thermo_king"
  | "carrier_transicold"
  | "roadpro"
  | "generic_shop";

export type MaintenanceIntegrationStatus = {
  provider: MaintenanceIntegrationProvider;
  kind: MaintenanceIntegrationKind;
  label: string;
  connected: boolean;
  lastSyncAt?: string;
  capabilities: string[];
};

export type TelematicsFaultCode = {
  provider: MaintenanceIntegrationProvider;
  truckId: string;
  code: string;
  description: string;
  severity: "info" | "warning" | "critical";
  recordedAt: string;
};

export type OemServiceBulletin = {
  provider: MaintenanceIntegrationProvider;
  vin?: string;
  bulletinId: string;
  title: string;
  publishedAt: string;
};

export type RepairShopWorkOrderSync = {
  provider: MaintenanceIntegrationProvider;
  externalId: string;
  status: string;
  estimatedCompletion?: string;
  invoiceTotal?: number;
};

export interface MaintenanceTelematicsAdapter {
  readonly provider: MaintenanceIntegrationProvider;
  listFaultCodes(truckId: string): Promise<TelematicsFaultCode[]>;
  getEngineHours(truckId: string): Promise<number | null>;
  getOdometer(truckId: string): Promise<number | null>;
}

export interface OemMaintenanceAdapter {
  readonly provider: MaintenanceIntegrationProvider;
  listBulletins(vin: string): Promise<OemServiceBulletin[]>;
  getWarrantyStatus(vin: string): Promise<{ active: boolean; endsAt?: string }>;
}

export interface RepairShopAdapter {
  readonly provider: MaintenanceIntegrationProvider;
  syncWorkOrder(externalId: string): Promise<RepairShopWorkOrderSync | null>;
  pushWorkOrder(payload: {
    unitNumber: string;
    complaint: string;
    priority: string;
  }): Promise<{ externalId: string }>;
}

const INTEGRATION_CATALOG: MaintenanceIntegrationStatus[] = [
  {
    provider: "samsara",
    kind: "telematics",
    label: "Samsara",
    connected: false,
    capabilities: ["fault_codes", "odometer", "engine_hours", "dtc_stream"],
  },
  {
    provider: "motive",
    kind: "telematics",
    label: "Motive",
    connected: false,
    capabilities: ["fault_codes", "odometer", "engine_hours"],
  },
  {
    provider: "geotab",
    kind: "telematics",
    label: "Geotab",
    connected: false,
    capabilities: ["fault_codes", "odometer", "engine_hours"],
  },
  {
    provider: "detroit",
    kind: "oem",
    label: "Detroit Diesel",
    connected: false,
    capabilities: ["service_bulletins", "warranty"],
  },
  {
    provider: "cummins",
    kind: "oem",
    label: "Cummins",
    connected: false,
    capabilities: ["service_bulletins", "warranty", "connected_diagnostics"],
  },
  {
    provider: "paccar",
    kind: "oem",
    label: "PACCAR",
    connected: false,
    capabilities: ["service_bulletins", "warranty"],
  },
  {
    provider: "thermo_king",
    kind: "reefer",
    label: "Thermo King",
    connected: false,
    capabilities: ["reefer_hours", "alarms", "warranty"],
  },
  {
    provider: "carrier_transicold",
    kind: "reefer",
    label: "Carrier Transicold",
    connected: false,
    capabilities: ["reefer_hours", "alarms", "warranty"],
  },
  {
    provider: "roadpro",
    kind: "repair_shop",
    label: "RoadPro / Shop Sync",
    connected: false,
    capabilities: ["work_order_push", "invoice_pull", "status_sync"],
  },
];

/** Deterministic mock fault for demos when a telematics adapter is wired. */
export function mockFaultCodes(truckId: string): TelematicsFaultCode[] {
  if (!truckId.includes("107") && !truckId.includes("112")) {
    return [];
  }
  return [
    {
      provider: "samsara",
      truckId,
      code: "SPN 157 FMI 18",
      description: "Injector metering rail pressure — data valid but below normal",
      severity: "warning",
      recordedAt: new Date().toISOString(),
    },
  ];
}

export function listMaintenanceIntegrations(): MaintenanceIntegrationStatus[] {
  return INTEGRATION_CATALOG.map((item) => ({ ...item }));
}

export function getMaintenanceIntegration(
  provider: MaintenanceIntegrationProvider,
): MaintenanceIntegrationStatus | undefined {
  return INTEGRATION_CATALOG.find((item) => item.provider === provider);
}

/** Stub adapter — connect real SDKs here without changing call sites. */
export const stubTelematicsAdapter: MaintenanceTelematicsAdapter = {
  provider: "samsara",
  async listFaultCodes(truckId) {
    return mockFaultCodes(truckId);
  },
  async getEngineHours() {
    return null;
  },
  async getOdometer() {
    return null;
  },
};

export const stubOemAdapter: OemMaintenanceAdapter = {
  provider: "detroit",
  async listBulletins() {
    return [];
  },
  async getWarrantyStatus() {
    return { active: false };
  },
};

export const stubRepairShopAdapter: RepairShopAdapter = {
  provider: "roadpro",
  async syncWorkOrder() {
    return null;
  },
  async pushWorkOrder() {
    return { externalId: `ext-${Date.now()}` };
  },
};
