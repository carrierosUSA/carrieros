"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  useLoadDetailActionTriggers,
} from "@/components/dispatch/load-detail/LoadDetailActionTriggersProvider";
import { useLoadDetailQuickTasks } from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";
import { useRegisterLoadQuickActions } from "@/components/quick-actions/QuickActionsProvider";

type LoadDetailQuickActionsBridgeProps = {
  loadId: string;
  loadReference: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

function formatLoadNumber(reference: string): string {
  return reference.replace(/^LD-/i, "");
}

export default function LoadDetailQuickActionsBridge({
  loadId,
  loadReference,
  trackingEnabled,
  hasDriver,
}: LoadDetailQuickActionsBridgeProps) {
  const router = useRouter();
  const { openTask } = useLoadDetailQuickTasks();
  const { triggerAssignDriver, triggerAssignTruck } = useLoadDetailActionTriggers();

  const trackingAvailable = trackingEnabled && hasDriver;
  const trackingHref = `/loads/${loadId}/tracking`;

  const handlers = useMemo(
    () => ({
      loadId,
      loadLabel: formatLoadNumber(loadReference),
      assignDriver: () => triggerAssignDriver(),
      assignTruck: () => triggerAssignTruck(),
      createInvoice: () => openTask("createInvoice"),
      emailBroker: () => openTask("notifyBroker"),
      requestPayment: () => openTask("requestPayment"),
      openTracking: trackingAvailable
        ? () => router.push(trackingHref)
        : undefined,
      openCameras: trackingAvailable
        ? () => router.push(`${trackingHref}?view=cameras`)
        : undefined,
      trackingAvailable,
      camerasAvailable: trackingAvailable,
    }),
    [
      loadId,
      loadReference,
      openTask,
      router,
      trackingAvailable,
      trackingHref,
      triggerAssignDriver,
      triggerAssignTruck,
    ],
  );

  useRegisterLoadQuickActions(handlers);

  return null;
}
