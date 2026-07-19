export type LatLng = {
  lat: number;
  lng: number;
};

export type TrackingMapMarkerId = "pickup" | "delivery" | "truck";

export type TrackingMapMarker = {
  id: TrackingMapMarkerId;
  position: LatLng;
  label: string;
  heading?: number;
};

export type TrackingMapRoute = {
  coordinates: LatLng[];
  distanceMiles: number;
  durationMinutes: number;
};

export type TrackingStopDetails = {
  city: string;
  state: string;
  company?: string;
  address?: string;
  appointment?: string;
};

export type TrackingDriverDetails = {
  name: string;
  phone?: string;
  truckLabel?: string;
  trailerLabel?: string;
};

export type LiveTrackingStats = {
  currentLocation: string;
  speedMph: number;
  milesRemaining: number;
  eta: string;
  lastUpdated: string;
};

export type LiveTrackingSnapshot = {
  loadId: string;
  loadReference: string;
  isLive: boolean;
  pickup: TrackingMapMarker;
  delivery: TrackingMapMarker;
  truck: TrackingMapMarker;
  route: TrackingMapRoute;
  stats: LiveTrackingStats;
  pickupDetails: TrackingStopDetails;
  deliveryDetails: TrackingStopDetails;
  driver?: TrackingDriverDetails;
};

export type MapStyle = "road" | "satellite";

export type MapLayerVisibility = {
  traffic: boolean;
  weather: boolean;
  driver: boolean;
  pickup: boolean;
  delivery: boolean;
};

export type MapViewState = {
  style: MapStyle;
  layers: MapLayerVisibility;
};

export const DEFAULT_MAP_VIEW_STATE: MapViewState = {
  style: "road",
  layers: {
    traffic: false,
    weather: false,
    driver: true,
    pickup: true,
    delivery: true,
  },
};

/** Provider-agnostic contract for Mapbox / Google Maps adapters later. */
export type TrackingMapProviderName = "leaflet" | "mapbox" | "google";

export type TrackingMapController = {
  provider: TrackingMapProviderName;
  setStyle: (style: MapStyle) => void;
  setMarkers: (markers: TrackingMapMarker[], visibility: MapLayerVisibility) => void;
  setRoute: (route: TrackingMapRoute | null) => void;
  setOverlays: (layers: Pick<MapLayerVisibility, "traffic" | "weather">) => void;
  fitRoute: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  destroy: () => void;
};

export type CreateTrackingMapOptions = {
  onMapClick?: () => void;
};
