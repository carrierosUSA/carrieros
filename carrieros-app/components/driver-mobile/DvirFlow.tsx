"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
} from "@/components/driver-mobile/ui";
import type { DvirTripType } from "@/lib/driver-mobile/types";

export default function DvirFlow() {
  const { submitDvir } = useDriverMobile();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tripType, setTripType] = useState<DvirTripType>("pre_trip");
  const [notes, setNotes] = useState("");
  const [defectText, setDefectText] = useState("");

  function goBack() {
    if (pathname.startsWith("/driver/dvir")) {
      router.push("/driver/more");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onSubmit() {
    const defects = defectText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((description, index) => ({
        id: `def-${index}`,
        area: "General",
        description,
      }));

    submitDvir({
      tripType,
      defects,
      notes: notes.trim() || (defects.length === 0 ? "No defects noted" : ""),
      signatureName: "Driver",
    });
    goBack();
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={goBack}
        className="text-[14px] font-semibold text-[var(--color-info)]"
      >
        ← Back
      </button>
      <DmSectionLabel>DVIR</DmSectionLabel>
      <DmCard className="space-y-3">
        <div className="flex gap-2">
          {(["pre_trip", "post_trip"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`flex-1 rounded-2xl px-3 py-3 text-[14px] font-semibold ${
                tripType === t
                  ? "bg-blue-500/15 text-[var(--color-info)]"
                  : "bg-[var(--dm-elevated)]"
              }`}
            >
              {t === "pre_trip" ? "Pre-trip" : "Post-trip"}
            </button>
          ))}
        </div>
        <textarea
          placeholder="Defects (one per line)"
          value={defectText}
          onChange={(e) => setDefectText(e.target.value)}
          className="min-h-28 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 py-3 text-[15px]"
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-20 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 py-3 text-[15px]"
        />
        <DmPrimaryButton onClick={onSubmit}>Submit DVIR</DmPrimaryButton>
      </DmCard>
    </div>
  );
}
