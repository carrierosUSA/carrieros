import {
  geocodeCityState,
  interpolatePosition,
} from "@/lib/tracking/map-geocoding";
import type { LatLng, TrackingMapRoute } from "@/lib/tracking/map-types";

function decodePolyline(encoded: string): LatLng[] {
  const coordinates: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

function fallbackRoute(start: LatLng, end: LatLng): TrackingMapRoute {
  const coordinates: LatLng[] = [];
  const steps = 48;

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const curve = Math.sin(t * Math.PI) * 0.08;
    const point = interpolatePosition(start, end, t);

    coordinates.push({
      lat: point.lat + curve,
      lng: point.lng - curve * 0.6,
    });
  }

  const distanceMiles = haversineMiles(start, end) * 1.18;

  return {
    coordinates,
    distanceMiles,
    durationMinutes: Math.round(distanceMiles / 52 * 60),
  };
}

function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
}

export async function fetchDrivingRoute(
  start: LatLng,
  end: LatLng,
): Promise<TrackingMapRoute> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`;

    const response = await fetch(url);

    if (!response.ok) {
      return fallbackRoute(start, end);
    }

    const payload = (await response.json()) as {
      routes?: Array<{
        geometry?: string;
        distance?: number;
        duration?: number;
      }>;
    };

    const route = payload.routes?.[0];

    if (!route?.geometry) {
      return fallbackRoute(start, end);
    }

    return {
      coordinates: decodePolyline(route.geometry),
      distanceMiles: (route.distance ?? 0) / 1609.34,
      durationMinutes: Math.round((route.duration ?? 0) / 60),
    };
  } catch {
    return fallbackRoute(start, end);
  }
}

export function positionAlongRoute(
  route: TrackingMapRoute,
  progress: number,
): LatLng {
  if (route.coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (route.coordinates.length === 1) {
    return route.coordinates[0];
  }

  const index = Math.min(
    route.coordinates.length - 1,
    Math.max(0, Math.round(progress * (route.coordinates.length - 1))),
  );

  return route.coordinates[index];
}

export function buildRouteEndpoints(
  originCity: string,
  originState: string,
  destinationCity: string,
  destinationState: string,
) {
  return {
    pickup: geocodeCityState(originCity, originState),
    delivery: geocodeCityState(destinationCity, destinationState),
  };
}
