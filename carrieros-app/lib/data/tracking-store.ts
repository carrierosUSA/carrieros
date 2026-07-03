import type { TrackingNovaEvent, TrackingRecord } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const trackingStore: TrackingRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "tracking-load-24001",
    loadId: "load-24001",
    token: "trk_XlK8bQw9Z2mN4pR7tV6yH3sA1dF0gJ",
    enabled: true,
    createdAt: "2026-07-02T14:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "tracking-load-24002",
    loadId: "load-24002",
    token: "trk_Qp4M8nY2vB7cX0zL5rT9hW3kE6aS1d",
    enabled: true,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "tracking-load-24003",
    loadId: "load-24003",
    token: "trk_H7sD2fG9jK4lP0qR8wE5tY1uI6oA3b",
    enabled: true,
    createdAt: "2026-06-30T16:00:00Z",
    lastEtaMinutes: 92,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "tracking-load-24004",
    loadId: "load-24004",
    token: "trk_Delivered8fG9jK4lP0qR8wE5tY1",
    enabled: true,
    createdAt: "2026-06-27T10:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "tracking-load-24005",
    loadId: "load-24005",
    token: "trk_Invoiced2fG9jK4lP0qR8wE5tY1",
    enabled: true,
    createdAt: "2026-06-19T08:00:00Z",
  },
];

export const trackingNovaEventStore: TrackingNovaEvent[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "tracking-event-load-24003-eta",
    loadId: "load-24003",
    type: "eta_changed",
    message: "ETA changed.",
    createdAt: "2026-07-02T18:05:00Z",
  },
];
