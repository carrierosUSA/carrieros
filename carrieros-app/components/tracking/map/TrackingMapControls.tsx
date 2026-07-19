"use client";

import type { MapLayerVisibility, MapStyle } from "@/lib/tracking/map-types";

type ControlItem = {
  id: keyof MapLayerVisibility | "style-road" | "style-satellite";
  label: string;
  emoji: string;
  group: "style" | "overlay" | "marker";
};

const CONTROLS: ControlItem[] = [
  { id: "style-road", label: "Road", emoji: "🗺", group: "style" },
  { id: "style-satellite", label: "Satellite", emoji: "🛰", group: "style" },
  { id: "traffic", label: "Traffic", emoji: "🚦", group: "overlay" },
  { id: "weather", label: "Weather", emoji: "🌧", group: "overlay" },
  { id: "driver", label: "Driver", emoji: "📍", group: "marker" },
  { id: "pickup", label: "Pickup", emoji: "📦", group: "marker" },
  { id: "delivery", label: "Delivery", emoji: "🏁", group: "marker" },
];

type TrackingMapControlsProps = {
  style: MapStyle;
  layers: MapLayerVisibility;
  onStyleChange: (style: MapStyle) => void;
  onLayerToggle: (layer: keyof MapLayerVisibility) => void;
  compact?: boolean;
};

export default function TrackingMapControls({
  style,
  layers,
  onStyleChange,
  onLayerToggle,
  compact = false,
}: TrackingMapControlsProps) {
  function isActive(control: ControlItem) {
    if (control.id === "style-road") {
      return style === "road";
    }

    if (control.id === "style-satellite") {
      return style === "satellite";
    }

    return layers[control.id as keyof MapLayerVisibility];
  }

  function handleClick(control: ControlItem) {
    if (control.id === "style-road") {
      onStyleChange("road");
      return;
    }

    if (control.id === "style-satellite") {
      onStyleChange("satellite");
      return;
    }

    onLayerToggle(control.id as keyof MapLayerVisibility);
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "" : "border-b border-[#F1F5F9] px-4 py-3"}`}
    >
      {CONTROLS.map((control) => {
        const active = isActive(control);

        return (
          <button
            key={control.id}
            type="button"
            onClick={() => handleClick(control)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
              active
                ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] shadow-sm"
                : "border-[#EAEAEA] bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span aria-hidden>{control.emoji}</span>
            <span>{control.label}</span>
          </button>
        );
      })}
    </div>
  );
}
