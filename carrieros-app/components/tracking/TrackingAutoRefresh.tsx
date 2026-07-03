"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type TrackingAutoRefreshProps = {
  intervalMs?: number;
};

export default function TrackingAutoRefresh({
  intervalMs = 15000,
}: TrackingAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
