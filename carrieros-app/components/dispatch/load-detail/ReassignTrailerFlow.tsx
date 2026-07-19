"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { reassignTrailerAction } from "@/app/loads/actions";
import type { ReassignTrailerResult } from "@/app/loads/actions";
import ReassignModalShell, {
  ReassignEmailPreview,
  ReassignPicker,
  ReassignSuccess,
} from "@/components/dispatch/load-detail/ReassignModalShell";

export type ReassignTrailerOption = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
};

type ReassignTrailerFlowProps = {
  loadId: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  brokerEmail?: string;
  trailers: ReassignTrailerOption[];
  currentTrailerId?: string;
  open: boolean;
  onClose: () => void;
};

type Step = "select" | "success" | "email";

function formatLoadNumber(reference: string): string {
  return reference.replace(/^LD-/i, "");
}

function buildEmailBody(
  loadReference: string,
  result: ReassignTrailerResult,
  pickupLabel: string,
  deliveryLabel: string,
): string {
  return [
    "Hello,",
    "",
    "Updated equipment for this load:",
    "",
    `Load #: ${formatLoadNumber(loadReference)}`,
    `Truck: ${result.truckNumber ?? "—"}`,
    `Trailer: ${result.trailerNumber}`,
    `Pickup: ${pickupLabel}`,
    `Delivery: ${deliveryLabel}`,
    "",
    "Thank you.",
  ].join("\n");
}

export default function ReassignTrailerFlow({
  loadId,
  loadReference,
  pickupLabel,
  deliveryLabel,
  brokerEmail,
  trailers,
  currentTrailerId,
  open,
  onClose,
}: ReassignTrailerFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReassignTrailerResult | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTrailers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? trailers.filter(
          (trailer) =>
            trailer.unitNumber.toLowerCase().includes(normalized) ||
            trailer.type.toLowerCase().includes(normalized),
        )
      : trailers;

    return list.map((trailer) => ({
      id: trailer.id,
      name: trailer.unitNumber,
      detail: `${trailer.type.replaceAll("_", " ")} · ${trailer.status.replaceAll("_", " ")}`,
    }));
  }, [trailers, query]);

  function closeAndRefresh() {
    setStep("select");
    setQuery("");
    setError(null);
    setResult(null);
    setPendingId(null);
    onClose();
    router.refresh();
  }

  function handleSelect(trailerId: string) {
    setError(null);
    setPendingId(trailerId);
    startTransition(async () => {
      try {
        const assignment = await reassignTrailerAction(loadId, trailerId);
        setResult(assignment);
        setStep("success");
      } catch (assignError) {
        setError(
          assignError instanceof Error
            ? assignError.message
            : "Could not reassign trailer.",
        );
      } finally {
        setPendingId(null);
      }
    });
  }

  const emailSubject = `Trailer Update — Load #${formatLoadNumber(loadReference)}`;
  const emailBody =
    result && brokerEmail
      ? buildEmailBody(loadReference, result, pickupLabel, deliveryLabel)
      : "";

  const isAssign = !currentTrailerId;

  return (
    <ReassignModalShell
      open={open}
      onClose={closeAndRefresh}
      title={isAssign ? "Assign Trailer" : "Reassign Trailer"}
    >
      {step === "select" ? (
        <ReassignPicker
          searchPlaceholder="Search Trailer"
          listLabel="Saved Trailers"
          addNewHref="/fleet/trailers/new"
          addNewLabel="+ Add New Trailer"
          items={filteredTrailers}
          currentId={currentTrailerId}
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
              ? `✅ Trailer assigned to ${result.trailerNumber}.`
              : `✅ Trailer reassigned to ${result.trailerNumber}.`
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
