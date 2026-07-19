import { Check, Square, Truck } from "lucide-react";
import type { LoadStatus } from "@/lib/types";

const TIMELINE_STEPS = [
  { key: "assigned", label: "Assigned" },
  { key: "loaded", label: "Loaded" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "invoice_sent", label: "Invoice Sent" },
] as const;

export type TimelineStepState = "done" | "current" | "upcoming";

export type TimelineStep = {
  label: string;
  state: TimelineStepState;
};

function timelineIndex(status: LoadStatus): number {
  switch (status) {
    case "pending":
    case "dispatched":
      return 0;
    case "picked_up":
      return 1;
    case "in_transit":
      return 2;
    case "delivered":
      return 3;
    case "invoiced":
      return TIMELINE_STEPS.length;
    default:
      return 0;
  }
}

export function buildTimelineSteps(status: LoadStatus): TimelineStep[] {
  const currentIndex = timelineIndex(status);

  return TIMELINE_STEPS.map((step, index) => ({
    label: step.label,
    state:
      status === "invoiced" || index < currentIndex
        ? "done"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

function connectorClass(leftState: TimelineStepState): string {
  if (leftState === "done") {
    return "bg-emerald-400";
  }

  if (leftState === "current") {
    return "bg-gradient-to-r from-[#1E3A8A] to-slate-200";
  }

  return "bg-slate-200";
}

function StepIcon({
  label,
  state,
}: {
  label: string;
  state: TimelineStepState;
}) {
  const isInTransit = label === "In Transit";

  if (state === "done") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/80">
        <Check
          className="h-3.5 w-3.5 text-emerald-600"
          strokeWidth={2.5}
          aria-hidden
        />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A8A]/10 ring-2 ring-[#1E3A8A]/30">
        {isInTransit ? (
          <Truck
            className="h-3.5 w-3.5 text-[#1E3A8A]"
            strokeWidth={2}
            aria-hidden
          />
        ) : (
          <span
            className="h-2 w-2 rounded-full bg-[#1E3A8A]"
            aria-hidden
          />
        )}
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200/80">
      <Square
        className="h-3 w-3 text-slate-300"
        strokeWidth={2}
        aria-hidden
      />
    </span>
  );
}

function stepLabelClass(state: TimelineStepState): string {
  if (state === "done") {
    return "font-medium text-emerald-700";
  }

  if (state === "current") {
    return "font-semibold text-[#1E3A8A]";
  }

  return "font-medium text-slate-400";
}

type LoadDetailTimelineProps = {
  steps: TimelineStep[];
};

export default function LoadDetailTimeline({ steps }: LoadDetailTimelineProps) {
  return (
    <div className="overflow-x-auto pb-0.5">
      <ol
        className="flex min-w-max items-start"
        aria-label="Load progress"
      >
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="flex items-start"
            aria-current={step.state === "current" ? "step" : undefined}
          >
            {index > 0 ? (
              <span
                className={`mt-3 h-px w-6 shrink-0 sm:w-8 ${connectorClass(steps[index - 1]!.state)}`}
                aria-hidden
              />
            ) : null}
            <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 sm:w-[5.25rem]">
              <StepIcon label={step.label} state={step.state} />
              <span
                className={`text-center text-[10px] leading-tight ${stepLabelClass(step.state)}`}
              >
                {step.label}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
