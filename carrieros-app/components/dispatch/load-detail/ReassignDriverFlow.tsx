"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { reassignDriverAction } from "@/app/loads/actions";
import type { ReassignDriverResult } from "@/app/loads/actions";
import ReassignModalShell, {
  ReassignEmailPreview,
  ReassignPicker,
  ReassignSuccess,
} from "@/components/dispatch/load-detail/ReassignModalShell";
import PickupNumbersDisplay from "@/components/loads/PickupNumbersDisplay";
import { orderedPickupNumbers } from "@/lib/loads/pickup-numbers";

export type ReassignDriverOption = {
  id: string;
  name: string;
  phone: string;
  status: string;
  truckLabel?: string;
  trailerLabel?: string;
};

type ReassignDriverFlowProps = {
  loadId: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  brokerEmail?: string;
  drivers: ReassignDriverOption[];
  currentDriverId?: string;
  open: boolean;
  onClose: () => void;
};

type Step = "select" | "success" | "email";

function formatLoadNumber(reference: string): string {
  return reference.replace(/^LD-/i, "");
}

function buildEmailBody(
  loadReference: string,
  result: ReassignDriverResult,
  pickupLabel: string,
  deliveryLabel: string,
): string {
  const pickupNumberLines = orderedPickupNumbers(result.pickupNumbers).map(
    (entry) =>
      `PICKUP NUMBER: ${entry.value}${
        entry.pickupStopLabel ? ` (${entry.pickupStopLabel})` : ""
      }`,
  );
  return [
    "Hello,",
    "",
    "Updated driver information for this load:",
    "",
    `Load #: ${formatLoadNumber(loadReference)}`,
    `Driver: ${result.driverName}`,
    `Driver Phone: ${result.driverPhone}`,
    `Truck: ${result.truckNumber ?? "—"}`,
    `Trailer: ${result.trailerNumber ?? "—"}`,
    `Pickup: ${pickupLabel}`,
    ...pickupNumberLines,
    `Delivery: ${deliveryLabel}`,
    "",
    "Thank you.",
  ].join("\n");
}

export default function ReassignDriverFlow({
  loadId,
  loadReference,
  pickupLabel,
  deliveryLabel,
  brokerEmail,
  drivers,
  currentDriverId,
  open,
  onClose,
}: ReassignDriverFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReassignDriverResult | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredDrivers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? drivers.filter(
          (driver) =>
            driver.name.toLowerCase().includes(normalized) ||
            driver.phone.includes(normalized),
        )
      : drivers;

    return list.map((driver) => ({
      id: driver.id,
      name: driver.name,
      detail: `${driver.phone} · ${driver.status}${
        driver.truckLabel ? ` · Truck ${driver.truckLabel}` : ""
      }`,
    }));
  }, [drivers, query]);

  function closeAndRefresh() {
    setStep("select");
    setQuery("");
    setError(null);
    setResult(null);
    setPendingId(null);
    onClose();
    router.refresh();
  }

  function handleSelect(driverId: string) {
    setError(null);
    setPendingId(driverId);
    startTransition(async () => {
      try {
        const assignment = await reassignDriverAction(loadId, driverId);
        setResult(assignment);
        setStep("success");
      } catch (assignError) {
        setError(
          assignError instanceof Error
            ? assignError.message
            : "Could not reassign driver.",
        );
      } finally {
        setPendingId(null);
      }
    });
  }

  const emailSubject = `Driver Update — Load #${formatLoadNumber(loadReference)}`;
  const emailBody =
    result && brokerEmail
      ? buildEmailBody(loadReference, result, pickupLabel, deliveryLabel)
      : "";

  const isAssign = !currentDriverId;

  return (
    <ReassignModalShell
      open={open}
      onClose={closeAndRefresh}
      title={isAssign ? "Assign Driver" : "Reassign Driver"}
    >
      {step === "select" ? (
        <ReassignPicker
          searchPlaceholder="Search Driver"
          listLabel="Saved Drivers"
          addNewHref="/drivers/hiring/new"
          addNewLabel="+ Add New Driver"
          items={filteredDrivers}
          currentId={currentDriverId}
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
        <>
          <div className="border-b border-[#F1F5F9] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Driver dispatch summary
            </p>
            <p className="mt-1 text-[12px] font-semibold text-slate-900">
              Load #{formatLoadNumber(loadReference)}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Pickup: {pickupLabel}
            </p>
            <PickupNumbersDisplay
              pickupNumbers={result.pickupNumbers}
              className="mt-2"
            />
          </div>
          <ReassignSuccess
            message={
              isAssign
                ? "✅ Driver assigned successfully."
                : "✅ Driver reassigned successfully."
            }
            prompt="Would you like to notify the broker?"
            onEmail={() => setStep("email")}
            onSkip={closeAndRefresh}
          />
        </>
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
