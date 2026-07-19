"use client";

import { useState } from "react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import type { MaintenanceIssue } from "@/lib/driver-app/types";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
} from "@/components/driver-mobile/ui";

export default function MaintenanceView() {
  const { state, reportMaintenance } = useDriverApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] =
    useState<MaintenanceIssue["severity"]>("medium");

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Maintenance</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Report issues with photo / video / voice placeholders. AI suggests likely causes.
        </p>
      </div>

      <DmCard className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          className="min-h-12 w-full rounded-2xl bg-[var(--dm-elevated)] px-4 text-[16px] outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's happening?"
          rows={3}
          className="w-full rounded-2xl bg-[var(--dm-elevated)] px-4 py-3 text-[16px] outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {(["low", "medium", "high", "critical"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`min-h-11 rounded-full px-3.5 text-[13px] font-semibold capitalize ${
                severity === s
                  ? "bg-[var(--color-info)] text-white"
                  : "bg-[var(--dm-elevated)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MediaPlaceholder label="Photo" />
          <MediaPlaceholder label="Video" />
          <MediaPlaceholder label="Voice" />
        </div>
        <DmPrimaryButton
          disabled={!title.trim()}
          onClick={() => {
            reportMaintenance({
              unit: state.truckUnit,
              severity,
              title: title.trim(),
              description: description.trim() || title.trim(),
              photoName: "issue-photo.jpg",
            });
            setTitle("");
            setDescription("");
          }}
        >
          Report issue
        </DmPrimaryButton>
      </DmCard>

      <DmSectionLabel>Open issues</DmSectionLabel>
      <div className="space-y-3">
        {state.maintenanceIssues.map((issue) => (
          <DmCard key={issue.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">{issue.title}</p>
                <p className="text-[13px] text-[var(--dm-muted)]">{issue.unit}</p>
              </div>
              <StatusChip
                label={issue.status.replace(/_/g, " ")}
                tone={issue.severity === "critical" ? "critical" : "warning"}
              />
            </div>
            <p className="text-[14px]">{issue.description}</p>
            {issue.aiPossibleIssue && (
              <p className="rounded-2xl bg-blue-500/10 px-3 py-2 text-[13px] text-[var(--color-info)]">
                {issue.aiPossibleIssue}
              </p>
            )}
          </DmCard>
        ))}
      </div>
    </div>
  );
}

function MediaPlaceholder({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex min-h-12 items-center justify-center rounded-2xl bg-[var(--dm-elevated)] text-[13px] font-semibold"
      title={`${label} capture — architecture-ready`}
    >
      {label}
    </button>
  );
}
