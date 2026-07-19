"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { reassignTruckAction } from "@/app/loads/actions";
import type { ReassignTruckResult } from "@/app/loads/actions";
import ReassignModalShell, {
  ReassignEmailPreview,
  ReassignPicker,
  ReassignSuccess,
} from "@/components/dispatch/load-detail/ReassignModalShell";

export type ReassignTruckOption = {
  id: string;
  unitNumber: string;
  status: string;
  trailerLabel?: string;
};

type ReassignTruckFlowProps = {
  loadId: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  brokerEmail?: string;
  trucks: ReassignTruckOption[];
  currentTruckId?: string;
  open: boolean;
  onClose: () => void;
};

type Step = "select" | "success" | "email";

function formatLoadNumber(reference: string): string {
  return reference.replace(/^LD-/i, "");
}

function buildEmailBody(
  loadReference: string,
  result: ReassignTruckResult,
  pickupLabel: string,
  deliveryLabel: string,
): string {
  return [
    "Hello,",
    "",
    "Updated equipment for this load:",
    "",
    `Load #: ${formatLoadNumber(loadReference)}`,
    `Truck: ${result.truckNumber}`,
    `Trailer: ${result.trailerNumber ?? "—"}`,
    `Pickup: ${pickupLabel}`,
    `Delivery: ${deliveryLabel}`,
    "",
    "Thank you.",
  ].join("\n");
}

export default function ReassignTruckFlow({
  loadId,
  loadReference,
  pickupLabel,
  deliveryLabel,
  brokerEmail,
  trucks,
  currentTruckId,
  open,
  onClose,
}: ReassignTruckFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReassignTruckResult | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTrucks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? trucks.filter(
          (truck) =>
            truck.unitNumber.toLowerCase().includes(normalized) ||
            truck.status.toLowerCase().includes(normalized),
        )
      : trucks;

    return list.map((truck) => ({
      id: truck.id,
      name: `Unit ${truck.unitNumber}`,
      detail: `${truck.status}${
        truck.trailerLabel ? ` · Trailer ${truck.trailerLabel}` : ""
      }`,
    }));
  }, [trucks, query]);

  function closeAndRefresh() {
    setStep("select");
    setQuery("");
    setError(null);
    setResult(null);
    setPendingId(null);
    onClose();
    router.refresh();
  }

  function handleSelect(truckId: string) {
    setError(null);
    setPendingId(truckId);
    startTransition(async () => {
      try {
        const assignment = await reassignTruckAction(loadId, truckId);
        setResult(assignment);
        setStep("success");
      } catch (assignError) {
        setError(
          assignError instanceof Error
            ? assignError.message
            : "Could not reassign truck.",
        );
      } finally {
        setPendingId(null);
      }
    });
  }

  const emailSubject = `Truck Update — Load #${formatLoadNumber(loadReference)}`;
  const emailBody =
    result && brokerEmail
      ? buildEmailBody(loadReference, result, pickupLabel, deliveryLabel)
      : "";

  const isAssign = !currentTruckId;

  return (
    <ReassignModalShell
      open={open}
      onClose={closeAndRefresh}
      title={isAssign ? "Assign Truck" : "Reassign Truck"}
    >
      {step === "select" ? (
        <ReassignPicker
          searchPlaceholder="Search Truck"
          listLabel="Saved Trucks"
          addNewHref="/fleet/trucks/new"
          addNewLabel="+ Add New Truck"
          items={filteredTrucks}
          currentId={currentTruckId}
          pendingId={pendingId}
          isPending={isPending}
          error={error}
          query={query}
          onQueryChange={setQuery}
          onSelect={handleSelect}
          onCancel={closeAndRefresh}
        />
      ) : null}

      {step === "success" && result ? (
        <ReassignSuccess
          message={
            isAssign
              ? `✅ Truck assigned to Unit ${result.truckNumber}.`
              : `✅ Truck reassigned to Unit ${result.truckNumber}.`
          }
          prompt="Would you like to notify the broker?"
          onEmail={() => setStep("email")}
          onSkip={closeAndRefresh}
        />
      ) : null}

      {step === "email" && result ? (
        <ReassignEmailPreview
          brokerEmail={brokerEmail}
          subject={emailSubject}
          body={emailBody}
          onDone={closeAndRefresh}
        />
      ) : null}
    </ReassignModalShell>
  );
}
