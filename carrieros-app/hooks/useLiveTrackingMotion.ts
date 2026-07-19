"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveTrackingSnapshot } from "@/lib/tracking/map-types";
import { positionAlongRoute } from "@/lib/tracking/map-route";

type UseLiveTrackingMotionOptions = {
  snapshot: LiveTrackingSnapshot;
  enabled?: boolean;
  intervalMs?: number;
};

function initialProgress(snapshot: LiveTrackingSnapshot): number {
  if (snapshot.route.distanceMiles <= 0) {
    return 0.5;
  }

  const traveled = snapshot.route.distanceMiles - snapshot.stats.milesRemaining;
  return Math.min(0.98, Math.max(0.02, traveled / snapshot.route.distanceMiles));
}

/**
 * Simulates live GPS movement along the route until a real provider stream is connected.
 */
export function useLiveTrackingMotion({
  snapshot,
  enabled = true,
  intervalMs = 5000,
}: UseLiveTrackingMotionOptions) {
  const [motionTick, setMotionTick] = useState(0);

  useEffect(() => {
    if (!enabled || !snapshot.isLive) {
      return;
    }

    const timer = window.setInterval(() => {
      setMotionTick((current) => current + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, snapshot.isLive, snapshot.loadId]);

  return useMemo(() => {
    if (!enabled || !snapshot.isLive) {
      return snapshot;
    }

    const progress = Math.min(
      0.98,
      initialProgress(snapshot) + motionTick * 0.004,
    );
    const truckPosition = positionAlongRoute(snapshot.route, progress);
    const milesRemaining = Math.max(
      0,
      Math.round(snapshot.route.distanceMiles * (1 - progress)),
    );

    return {
      ...snapshot,
      truck: {
        ...snapshot.truck,
        position: truckPosition,
        heading: ((snapshot.truck.heading ?? 90) + motionTick * 4) % 360,
      },
      stats: {
        ...snapshot.stats,
        milesRemaining,
        speedMph: 58 + Math.round(Math.sin(progress * 12) * 6),
        lastUpdated: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
      },
    };
  }, [enabled, motionTick, snapshot]);
}
