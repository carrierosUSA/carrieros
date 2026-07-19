import type { TelematicsProviderName } from "@/lib/types/fleet";

/**
 * Future hook point for Samsara, Motive, Geotab, and Omnitracs.
 * No live API calls — structured for provider adapters.
 */
export type TelematicsLocation = {
  lat: number;
  lng: number;
  heading?: number;
  speedMph?: number;
  address?: string;
  recordedAt: string;
};

export type TelematicsFuelSnapshot = {
  mpg: number;
  idleHours: number;
  fuelLevelPercent?: number;
  recordedAt: string;
};

export type TelematicsCameraFrame = {
  channelId: string;
  label: string;
  online: boolean;
  lastFrameAt?: string;
  /** Placeholder URL when a provider adapter is connected. */
  previewUrl?: string;
};

export type TelematicsVehicleSnapshot = {
  provider: TelematicsProviderName;
  truckId: string;
  location: TelematicsLocation | null;
  fuel: TelematicsFuelSnapshot | null;
  cameras: TelematicsCameraFrame[];
  connected: boolean;
};

export interface TelematicsProvider {
  readonly name: TelematicsProviderName;
  getVehicleSnapshot(truckId: string): Promise<TelematicsVehicleSnapshot>;
  getLiveLocation(truckId: string): Promise<TelematicsLocation | null>;
  listCameraChannels(truckId: string): Promise<TelematicsCameraFrame[]>;
  getFuelSnapshot(truckId: string): Promise<TelematicsFuelSnapshot | null>;
}

/** Deterministic mock coordinates keyed by truck id hash. */
function mockCoords(truckId: string): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < truckId.length; i += 1) {
    hash = (hash * 31 + truckId.charCodeAt(i)) >>> 0;
  }
  return {
    lat: 29.4 + (hash % 200) / 100,
    lng: -98.5 - (hash % 150) / 100,
  };
}

export const mockTelematicsProvider: TelematicsProvider = {
  name: "mock",

  async getLiveLocation(truckId) {
    const coords = mockCoords(truckId);
    return {
      ...coords,
      heading: 45,
      speedMph: 0,
      address: "San Antonio, TX",
      recordedAt: new Date().toISOString(),
    };
  },

  async listCameraChannels(truckId) {
    return [
      {
        channelId: `${truckId}-road`,
        label: "Road-facing",
        online: true,
        lastFrameAt: new Date().toISOString(),
      },
      {
        channelId: `${truckId}-driver`,
        label: "Driver-facing",
        online: true,
        lastFrameAt: new Date().toISOString(),
      },
      {
        channelId: `${truckId}-cargo`,
        label: "Cargo",
        online: false,
      },
    ];
  },

  async getFuelSnapshot() {
    return {
      mpg: 6.4,
      idleHours: 12.5,
      fuelLevelPercent: 62,
      recordedAt: new Date().toISOString(),
    };
  },

  async getVehicleSnapshot(truckId) {
    const [location, cameras, fuel] = await Promise.all([
      this.getLiveLocation(truckId),
      this.listCameraChannels(truckId),
      this.getFuelSnapshot(truckId),
    ]);

    return {
      provider: this.name,
      truckId,
      location,
      fuel,
      cameras,
      connected: true,
    };
  },
};

const providerRegistry: Record<TelematicsProviderName, TelematicsProvider | null> = {
  mock: mockTelematicsProvider,
  samsara: null,
  motive: null,
  geotab: null,
  omnitracs: null,
};

export function getTelematicsProvider(
  name: TelematicsProviderName = "mock",
): TelematicsProvider {
  return providerRegistry[name] ?? mockTelematicsProvider;
}

/** Trailer GPS uses the same provider adapters; asset id is the trailer id. */
export async function getTrailerLiveLocation(
  trailerId: string,
  providerName: TelematicsProviderName = "mock",
): Promise<TelematicsLocation | null> {
  const provider = getTelematicsProvider(providerName);
  return provider.getLiveLocation(trailerId);
}
