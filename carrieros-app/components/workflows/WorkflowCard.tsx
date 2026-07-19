"use client";

import Link from "next/link";
import { ArrowRight, Play, Zap } from "lucide-react";
import WorkflowEnableToggle from "@/components/workflows/WorkflowEnableToggle";
import WorkflowStatusBadge from "@/components/workflows/WorkflowStatusBadge";
import {
  getActionLabel,
  getTriggerLabel,
} from "@/lib/workflows/catalog";
import type { Workflow } from "@/lib/workflows/types";

type WorkflowCardProps = {
  workflow: Workflow;
  onToggle: (enabled: boolean) => void;
  onTestRun: () => void;
};

function formatRelative(iso?: string) {
  if (!iso) return "Never";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WorkflowCard({
  workflow,
  onToggle,
  onTestRun,
}: WorkflowCardProps) {
  const actionLabels = workflow.actions.map((a) => getActionLabel(a.type));

  return (
    <article className="group flex flex-col rounded-[18px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-[#EEF2F7] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <WorkflowStatusBadge enabled={workflow.enabled} />
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500">
              <Zap className="h-3.5 w-3.5 text-[#2563EB]" strokeWidth={2} />
              {getTriggerLabel(workflow.trigger.type)}
            </span>
          </div>
          <Link
            href={`/workflows/${workflow.id}`}
            className="block text-[17px] font-semibold tracking-[-0.02em] text-slate-900 transition hover:text-[#2563EB]"
          >
            {workflow.name}
          </Link>
          <p className="text-[14px] leading-relaxed text-slate-500">
            {workflow.description || "No description"}
          </p>
        </div>
        <WorkflowEnableToggle
          enabled={workflow.enabled}
          onChange={onToggle}
        />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Then
        </p>
        <div className="flex flex-wrap gap-1.5">
          {actionLabels.length === 0 ? (
            <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-medium text-slate-400">
              No actions
            </span>
          ) : (
            actionLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[12px] font-semibold text-[#1D4ED8]"
              >
                {label}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4">
        <div className="text-[13px] text-slate-500">
          <span className="font-semibold text-slate-800">{workflow.runCount}</span>{" "}
          runs · Last {formatRelative(workflow.lastRunAt)}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onTestRun();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 text-[13px] font-semibold text-slate-700 transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2.2} />
            Test
          </button>
          <Link
            href={`/workflows/${workflow.id}`}
            className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-[13px] font-semibold text-[#2563EB] transition hover:gap-1.5"
          >
            Open
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </article>
  );
}
