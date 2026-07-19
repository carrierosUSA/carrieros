"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ReassignModalShell, {
  ReassignConfirmAction,
  ReassignEmailPreview,
  ReassignSmsPreview,
} from "@/components/dispatch/load-detail/ReassignModalShell";
import {
  buildNotifyBrokerEmailBody,
  buildNotifyBrokerEmailSubject,
  buildPodRequestSmsBody,
  buildRateConEmailBody,
  buildRateConEmailSubject,
  buildRequestPaymentEmailBody,
  buildRequestPaymentEmailSubject,
} from "@/lib/dispatch/load-task-templates";

export type QuickTask =
  | "rateCon"
  | "requestPod"
  | "createInvoice"
  | "notifyBroker"
  | "requestPayment";

type LoadDetailQuickTasksContextValue = {
  openTask: (task: QuickTask) => void;
};

const LoadDetailQuickTasksContext =
  createContext<LoadDetailQuickTasksContextValue | null>(null);

export function useLoadDetailQuickTasks(): LoadDetailQuickTasksContextValue {
  const context = useContext(LoadDetailQuickTasksContext);

  if (!context) {
    throw new Error(
      "useLoadDetailQuickTasks must be used within LoadDetailQuickTasksProvider.",
    );
  }

  return context;
}

type LoadDetailQuickTasksProviderProps = {
  loadId: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  brokerEmail?: string;
  driverPhone?: string;
  driverName?: string;
  rate?: number;
  children: ReactNode;
};

export default function LoadDetailQuickTasksProvider({
  loadId,
  loadReference,
  pickupLabel,
  deliveryLabel,
  brokerEmail,
  driverPhone,
  driverName,
  rate,
  children,
}: LoadDetailQuickTasksProviderProps) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<QuickTask | null>(null);

  const taskContext = useMemo(
    () => ({
      loadReference,
      pickupLabel,
      deliveryLabel,
      rate,
      driverName,
    }),
    [deliveryLabel, driverName, loadReference, pickupLabel, rate],
  );

  const openTask = useCallback((task: QuickTask) => {
    setActiveTask(task);
  }, []);

  function closeTask() {
    setActiveTask(null);
  }

  function confirmCreateInvoice() {
    closeTask();
    router.push(`/documents/packets/${loadId}`);
  }

  const documentsHref = `/documents/packets/${loadId}`;

  return (
    <LoadDetailQuickTasksContext.Provider value={{ openTask }}>
      {children}

      <ReassignModalShell
        open={activeTask === "rateCon"}
        onClose={closeTask}
        title="Send Rate Confirmation"
        subtitle="Email preview — one click to send"
      >
        <ReassignEmailPreview
          brokerEmail={brokerEmail}
          subject={buildRateConEmailSubject(loadReference)}
          body={buildRateConEmailBody(taskContext)}
          onDone={closeTask}
          documentsHref={documentsHref}
          documentsLabel="View rate con documents"
        />
      </ReassignModalShell>

      <ReassignModalShell
        open={activeTask === "notifyBroker"}
        onClose={closeTask}
        title="Notify Broker"
        subtitle="Load update email preview"
      >
        <ReassignEmailPreview
          brokerEmail={brokerEmail}
          subject={buildNotifyBrokerEmailSubject(loadReference)}
          body={buildNotifyBrokerEmailBody(taskContext)}
          onDone={closeTask}
        />
      </ReassignModalShell>

      <ReassignModalShell
        open={activeTask === "requestPod"}
        onClose={closeTask}
        title="Request POD"
        subtitle="SMS preview to driver"
      >
        <ReassignSmsPreview
          phone={driverPhone}
          body={buildPodRequestSmsBody(taskContext)}
          onDone={closeTask}
        />
      </ReassignModalShell>

      <ReassignModalShell
        open={activeTask === "createInvoice"}
        onClose={closeTask}
        title="Create Invoice"
        subtitle="Opens invoice packet for this load"
      >
        <ReassignConfirmAction
          message="Ready to create the invoice?"
          detail="You'll review the document packet and finalize the invoice there."
          confirmLabel="Open Invoice Packet"
          onConfirm={confirmCreateInvoice}
          onCancel={closeTask}
        />
      </ReassignModalShell>

      <ReassignModalShell
        open={activeTask === "requestPayment"}
        onClose={closeTask}
        title="Request Payment"
        subtitle="Payment follow-up email preview"
      >
        <ReassignEmailPreview
          brokerEmail={brokerEmail}
          subject={buildRequestPaymentEmailSubject(loadReference)}
          body={buildRequestPaymentEmailBody(taskContext)}
          onDone={closeTask}
        />
      </ReassignModalShell>
    </LoadDetailQuickTasksContext.Provider>
  );
}
