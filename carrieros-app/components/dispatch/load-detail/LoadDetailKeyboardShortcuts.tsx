"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useRegisterLoadKeyboardActions } from "@/components/keyboard/KeyboardShortcutsProvider";
import { useLoadDetailCommunication } from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationProvider";
import { useLoadDetailQuickTasks } from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";

type LoadDetailKeyboardShortcutsProps = {
  loadId: string;
  brokerPhone?: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

export default function LoadDetailKeyboardShortcuts({
  loadId,
  brokerPhone,
  trackingEnabled,
  hasDriver,
}: LoadDetailKeyboardShortcutsProps) {
  const router = useRouter();
  const { call } = useLoadDetailCommunication();
  const { openTask } = useLoadDetailQuickTasks();

  const hasBrokerPhone = Boolean(brokerPhone && brokerPhone !== "—");
  const trackingAvailable = trackingEnabled && hasDriver;

  const actions = useMemo(
    () => ({
      invoice: () => openTask("createInvoice"),
      pod: () => openTask("requestPod"),
      broker: hasBrokerPhone
        ? () => {
            if (brokerPhone) {
              call(brokerPhone);
            }
          }
        : undefined,
      gps: trackingAvailable
        ? () => router.push(`/loads/${loadId}/tracking`)
        : undefined,
    }),
    [
      brokerPhone,
      call,
      hasBrokerPhone,
      loadId,
      openTask,
      router,
      trackingAvailable,
    ],
  );

  useRegisterLoadKeyboardActions(actions);

  return null;
}
