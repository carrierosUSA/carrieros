import type {
  EldMileageImportRequest,
  EldMileageImportResult,
  EldProviderId,
} from "./types";

/**
 * Future-ready stub for ELD mileage imports (Samsara, Motive, Geotab).
 * Wired to Integration Center telematics providers when OAuth + mileage APIs ship.
 */
export const ELD_IFTA_PROVIDERS: {
  id: EldProviderId;
  name: string;
  status: "coming_soon" | "connected_stub";
  description: string;
}[] = [
  {
    id: "samsara",
    name: "Samsara",
    status: "coming_soon",
    description: "Import jurisdiction miles and odometer deltas from Samsara fleet.",
  },
  {
    id: "motive",
    name: "Motive",
    status: "coming_soon",
    description: "Pull Motive ELD trip segments into IFTA quarters.",
  },
  {
    id: "geotab",
    name: "Geotab",
    status: "coming_soon",
    description: "Sync Geotab jurisdiction reports for accountant packages.",
  },
];

export async function importEldMileage(
  request: EldMileageImportRequest,
): Promise<EldMileageImportResult> {
  // Stub — no network call. Ready for telematics-provider.ts wiring.
  await Promise.resolve();
  return {
    provider: request.provider,
    importedSegments: 0,
    status: "stub",
    message: `${request.provider} mileage import is not connected yet. Use seeded trips until ELD OAuth ships.`,
  };
}

export function getEldImportStatusMessage(provider: EldProviderId): string {
  const item = ELD_IFTA_PROVIDERS.find((p) => p.id === provider);
  return item
    ? `${item.name}: ${item.description}`
    : "Unknown ELD provider.";
}
