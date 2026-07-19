"use client";

import DvirFlow from "@/components/driver-mobile/DvirFlow";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { DmCard, DmSectionLabel, StatusChip } from "@/components/driver-mobile/ui";

export default function DvirView() {
  const { state } = useDriverApp();

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">DVIR</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Pre / post-trip inspection, defects, media, signature, repair status.
        </p>
      </div>

      <DvirFlow />

      {state.dvirs.length > 0 && (
        <>
          <DmSectionLabel>Submitted</DmSectionLabel>
          <div className="space-y-2">
            {state.dvirs.map((d) => (
              <DmCard key={d.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold capitalize">
                    {d.tripType.replace(/_/g, " ")}
                  </p>
                  <p className="text-[13px] text-[var(--dm-muted)]">
                    {d.defects.length} defect{d.defects.length === 1 ? "" : "s"} ·{" "}
                    {new Date(d.submittedAt).toLocaleString()}
                  </p>
                </div>
                <StatusChip
                  label={d.status}
                  tone={d.status === "queued" ? "warning" : "success"}
                />
              </DmCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
