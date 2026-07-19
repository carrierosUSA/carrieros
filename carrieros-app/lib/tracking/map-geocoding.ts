import type { LatLng } from "@/lib/tracking/map-types";

const CITY_COORDINATES: Record<string, LatLng> = {
  "phoenix|az": { lat: 33.4484, lng: -112.074 },
  "los angeles|ca": { lat: 34.0522, lng: -118.2437 },
  "houston|tx": { lat: 29.7604, lng: -95.3698 },
  "dallas|tx": { lat: 32.7767, lng: -96.797 },
  "san antonio|tx": { lat: 29.4241, lng: -98.4936 },
  "laredo|tx": { lat: 27.5306, lng: -99.4803 },
  "memphis|tn": { lat: 35.1495, lng: -90.049 },
  "atlanta|ga": { lat: 33.749, lng: -84.388 },
  "chicago|il": { lat: 41.8781, lng: -87.6298 },
  "detroit|mi": { lat: 42.3314, lng: -83.0458 },
  "denver|co": { lat: 39.7392, lng: -104.9903 },
  "salt lake city|ut": { lat: 40.7608, lng: -111.891 },
  "kansas city|mo": { lat: 39.0997, lng: -94.5786 },
  "omaha|ne": { lat: 41.2565, lng: -95.9345 },
  "new orleans|la": { lat: 29.9511, lng: -90.0715 },
  "baton rouge|la": { lat: 30.4515, lng: -91.1871 },
  "tulsa|ok": { lat: 36.154, lng: -95.9928 },
  "little rock|ar": { lat: 34.7465, lng: -92.2896 },
  "fort worth|tx": { lat: 32.7555, lng: -97.3308 },
  "amarillo|tx": { lat: 35.222, lng: -101.8313 },
  "nashville|tn": { lat: 36.1627, lng: -86.7816 },
  "louisville|ky": { lat: 38.2527, lng: -85.7585 },
  "indianapolis|in": { lat: 39.7684, lng: -86.1581 },
  "columbus|oh": { lat: 39.9612, lng: -82.9988 },
  "miami|fl": { lat: 25.7617, lng: -80.1918 },
  "orlando|fl": { lat: 28.5383, lng: -81.3792 },
  "st. louis|mo": { lat: 38.627, lng: -90.1994 },
  "cincinnati|oh": { lat: 39.1031, lng: -84.512 },
  "birmingham|al": { lat: 33.5186, lng: -86.8104 },
  "mobile|al": { lat: 30.6954, lng: -88.0399 },
  "austin|tx": { lat: 30.2672, lng: -97.7431 },
};

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

function hashCoordinate(seed: string, min: number, max: number): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 1000;
  }

  const ratio = hash / 1000;
  return min + ratio * (max - min);
}

export function geocodeCityState(city: string, state: string): LatLng {
  const key = `${normalizeCity(city)}|${state.trim().toLowerCase()}`;
  const known = CITY_COORDINATES[key];

  if (known) {
    return known;
  }

  return {
    lat: hashCoordinate(`${key}-lat`, 30, 45),
    lng: hashCoordinate(`${key}-lng`, -110, -75),
  };
}

export function interpolatePosition(
  start: LatLng,
  end: LatLng,
  progress: number,
): LatLng {
  const t = Math.min(1, Math.max(0, progress));

  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t,
  };
}

export function formatCoordinatesLabel(position: LatLng): string {
  return `${position.lat.toFixed(2)}°N, ${Math.abs(position.lng).toFixed(2)}°${position.lng < 0 ? "W" : "E"}`;
}
