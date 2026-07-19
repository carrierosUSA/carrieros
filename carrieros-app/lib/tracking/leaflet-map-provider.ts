"use client";

import type {
  MapLayerVisibility,
  MapStyle,
  TrackingMapController,
  TrackingMapMarker,
  TrackingMapRoute,
} from "@/lib/tracking/map-types";
import type { LayerGroup, LatLngBounds } from "leaflet";

type LeafletModule = typeof import("leaflet");

const ROAD_TILES =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function markerHtml(emoji: string, label: string, accent: string) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:#fff;border:1px solid #EAEAEA;box-shadow:0 8px 20px rgba(15,23,42,0.12);font:600 12px system-ui,sans-serif;color:#111827;white-space:nowrap;">
        <span style="font-size:14px;line-height:1;">${emoji}</span>
        <span>${label}</span>
      </div>
      <div style="width:10px;height:10px;border-radius:999px;background:${accent};margin-top:-3px;border:2px solid #fff;box-shadow:0 0 0 2px ${accent}33;"></div>
    </div>
  `;
}

export async function createLeafletTrackingMap(
  container: HTMLElement,
  options?: import("@/lib/tracking/map-types").CreateTrackingMapOptions,
): Promise<TrackingMapController> {
  const leaflet = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  const map = leaflet.map(container, {
    zoomControl: false,
    attributionControl: true,
  });

  const roadLayer = leaflet.tileLayer(ROAD_TILES, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  const satelliteLayer = leaflet.tileLayer(SATELLITE_TILES, {
    maxZoom: 19,
    attribution: "Tiles &copy; Esri",
  });

  roadLayer.addTo(map);

  if (options?.onMapClick) {
    map.on("click", options.onMapClick);
  }

  const markerLayer = leaflet.layerGroup().addTo(map);
  const routeLayer = leaflet.layerGroup().addTo(map);
  const overlayLayer = leaflet.layerGroup().addTo(map);

  let currentStyle: MapStyle = "road";
  let routeBounds: LatLngBounds | null = null;

  function clearMarkers(layer: LayerGroup) {
    layer.clearLayers();
  }

  function renderMarkers(markers: TrackingMapMarker[], visibility: MapLayerVisibility) {
    clearMarkers(markerLayer);

    for (const marker of markers) {
      if (marker.id === "pickup" && !visibility.pickup) continue;
      if (marker.id === "delivery" && !visibility.delivery) continue;
      if (marker.id === "truck" && !visibility.driver) continue;

      const emoji =
        marker.id === "pickup" ? "📍" : marker.id === "delivery" ? "🏁" : "🚛";
      const accent =
        marker.id === "pickup"
          ? "#2563EB"
          : marker.id === "delivery"
            ? "#16A34A"
            : "#111827";

      leaflet
        .marker([marker.position.lat, marker.position.lng], {
          icon: leaflet.divIcon({
            className: "",
            html: markerHtml(emoji, marker.label, accent),
            iconSize: [0, 0],
          }),
        })
        .addTo(markerLayer);
    }
  }

  function renderRoute(route: TrackingMapRoute | null) {
    clearMarkers(routeLayer);
    routeBounds = null;

    if (!route || route.coordinates.length < 2) {
      return;
    }

    const latLngs = route.coordinates.map(
      (point) => [point.lat, point.lng] as [number, number],
    );

    leaflet
      .polyline(latLngs, {
        color: "#ffffff",
        weight: 8,
        opacity: 0.65,
        lineCap: "round",
        lineJoin: "round",
      })
      .addTo(routeLayer);

    leaflet
      .polyline(latLngs, {
        color: "#2563EB",
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      })
      .addTo(routeLayer);

    routeBounds = leaflet.latLngBounds(latLngs);
  }

  function renderOverlays(layers: Pick<MapLayerVisibility, "traffic" | "weather">) {
    clearMarkers(overlayLayer);

    if (!routeBounds) {
      return;
    }

    const center = routeBounds.getCenter();

    if (layers.traffic) {
      leaflet
        .circle(center, {
          radius: 18000,
          color: "#EA580C",
          fillColor: "#FB923C",
          fillOpacity: 0.18,
          weight: 1,
        })
        .addTo(overlayLayer);
    }

    if (layers.weather) {
      leaflet
        .circle([center.lat + 0.12, center.lng - 0.08], {
          radius: 24000,
          color: "#38BDF8",
          fillColor: "#7DD3FC",
          fillOpacity: 0.16,
          weight: 1,
        })
        .addTo(overlayLayer);
    }
  }

  return {
    provider: "leaflet",
    setStyle(style: MapStyle) {
      if (style === currentStyle) {
        return;
      }

      currentStyle = style;

      if (style === "satellite") {
        map.removeLayer(roadLayer);
        satelliteLayer.addTo(map);
      } else {
        map.removeLayer(satelliteLayer);
        roadLayer.addTo(map);
      }
    },
    setMarkers(markers, visibility) {
      renderMarkers(markers, visibility);
    },
    setRoute(route) {
      renderRoute(route);
      fitRouteInternal();
    },
    setOverlays(layers) {
      renderOverlays(layers);
    },
    fitRoute() {
      fitRouteInternal();
    },
    zoomIn() {
      map.zoomIn();
    },
    zoomOut() {
      map.zoomOut();
    },
    destroy() {
      map.remove();
    },
  };

  function fitRouteInternal() {
    if (routeBounds) {
      map.fitBounds(routeBounds, { padding: [36, 36] });
      return;
    }

    map.setView([39.5, -98.35], 4);
  }
}

export type LeafletMapHandle = {
  fitRoute: () => void;
};
