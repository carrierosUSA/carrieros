"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import FadeIn from "@/components/ui/FadeIn";
import FinanceFeedbackToast from "@/components/finance/FinanceFeedbackToast";
import SimulateEventPanel from "@/components/workflows/SimulateEventPanel";
import WorkflowCard from "@/components/workflows/WorkflowCard";
import WorkflowSearchBar from "@/components/workflows/WorkflowSearchBar";
import {
  buildWorkflowStats,
  filterWorkflowsByQuery,
  getWorkflowsSnapshot,
  hydrateWorkflowStore,
  setWorkflowEnabled,
  simulateWorkflowEvent,
  subscribeWorkflows,
  testRunWorkflow,
} from "@/lib/data/workflow-store";
import { getTriggerLabel } from "@/lib/workflows/catalog";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

function useWorkflows() {
  useEffect(() => {
    hydrateWorkflowStore();
  }, []);

  return useSyncExternalStore(
    subscribeWorkflows,
    getWorkflowsSnapshot,
    getWorkflowsSnapshot,
  );
}

export default function WorkflowDashboardClient() {
  const workflows = useWorkflows();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const stats = useMemo(() => buildWorkflowStats(workflows), [workflows]);
  const filtered = useMemo(
    () => filterWorkflowsByQuery(workflows, query),
    [workflows, query],
  );

  function showToast(message: string) {
    setToast(message);
  }

  function handleToggle(id: string, enabled: boolean) {
    setWorkflowEnabled(id, enabled);
    showToast(enabled ? "Workflow enabled" : "Workflow disabled");
  }

  function handleTestRun(id: string) {
    const run = testRunWorkflow(id);
    if (!run) {
      showToast("Workflow not found");
      return;
    }
    if (run.status === "skipped") {
      showToast("Test run skipped — conditions not met");
      return;
    }
    showToast(
      run.status === "success"
        ? "Test run completed"
        : "Test run finished with errors",
    );
  }

  function handleSimulate(type: WorkflowTriggerType) {
    const result = simulateWorkflowEvent(type);
    if (result.matched === 0) {
      showToast(`No enabled workflows for ${getTriggerLabel(type)}`);
      return;
    }
    const successes = result.runs.filter((r) => r.status === "success").length;
    const skipped = result.runs.filter((r) => r.status === "skipped").length;
    showToast(
      `Fired ${getTriggerLabel(type)} · ${successes} ran${skipped ? `, ${skipped} skipped` : ""}`,
    );
  }

  return (
    <FadeIn className="space-y-6">
      <FinanceFeedbackToast message={toast} onDismiss={() => setToast(null)} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Workflows", value: stats.total },
          { label: "Enabled", value: stats.enabled },
          { label: "Disabled", value: stats.disabled },
          { label: "Total runs", value: stats.totalRuns },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[16px] bg-[#F8FAFC] px-4 py-4 ring-1 ring-[#EEF2F7]"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {stat.label}
            </p>
            <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <SimulateEventPanel onSimulate={handleSimulate} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-slate-900">
            Your workflows
          </p>
          <Link
            href="/workflows/new"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            + New workflow
          </Link>
        </div>
        <WorkflowSearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
          <p className="text-[15px] font-semibold text-slate-900">
            No workflows found
          </p>
          <p className="mt-1 text-[14px] text-slate-500">
            Try a different search or create a new automation.
          </p>
          <Link
            href="/workflows/new"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Create workflow
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onToggle={(enabled) => handleToggle(workflow.id, enabled)}
              onTestRun={() => handleTestRun(workflow.id)}
            />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
