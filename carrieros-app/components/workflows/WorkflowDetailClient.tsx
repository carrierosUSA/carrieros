"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import FadeIn from "@/components/ui/FadeIn";
import ActionTooltip from "@/components/ui/ActionTooltip";
import FinanceFeedbackToast from "@/components/finance/FinanceFeedbackToast";
import WorkflowEnableToggle from "@/components/workflows/WorkflowEnableToggle";
import WorkflowRunHistory from "@/components/workflows/WorkflowRunHistory";
import WorkflowStatusBadge from "@/components/workflows/WorkflowStatusBadge";
import {
  CONDITION_OPERATOR_LABELS,
  getActionLabel,
  getFieldLabel,
  getTriggerLabel,
} from "@/lib/workflows/catalog";
import {
  deleteWorkflow,
  getRunsSnapshot,
  getWorkflowById,
  getWorkflowsSnapshot,
  hydrateWorkflowStore,
  listRunsForWorkflow,
  setWorkflowEnabled,
  subscribeWorkflows,
  testRunWorkflow,
} from "@/lib/data/workflow-store";

type WorkflowDetailClientProps = {
  workflowId: string;
};

function useStoreVersion() {
  useEffect(() => {
    hydrateWorkflowStore();
  }, []);

  return useSyncExternalStore(
    subscribeWorkflows,
    () => `${getWorkflowsSnapshot().length}:${getRunsSnapshot().length}:${getRunsSnapshot()[0]?.id ?? ""}`,
    () => "ssr",
  );
}

export default function WorkflowDetailClient({
  workflowId,
}: WorkflowDetailClientProps) {
  const router = useRouter();
  const version = useStoreVersion();
  const [toast, setToast] = useState<string | null>(null);

  const workflow = useMemo(
    () => getWorkflowById(workflowId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version tracks store mutations
    [workflowId, version],
  );

  const runs = useMemo(
    () => (workflow ? listRunsForWorkflow(workflow.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflowId, version],
  );

  if (!workflow) {
    return (
      <FadeIn className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">
          Workflow not found
        </p>
        <p className="mt-1 text-[14px] text-slate-500">
          It may have been deleted or never existed.
        </p>
        <Link
          href="/workflows"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white"
        >
          Back to workflows
        </Link>
      </FadeIn>
    );
  }

  function handleTestRun() {
    const run = testRunWorkflow(workflowId);
    if (!run) return;
    setToast(
      run.status === "skipped"
        ? "Test run skipped — conditions not met"
        : run.status === "success"
          ? "Test run completed"
          : "Test run finished with errors",
    );
  }

  function handleDelete() {
    const ok = window.confirm(
      `Delete “${workflow!.name}”? This cannot be undone.`,
    );
    if (!ok) return;
    deleteWorkflow(workflowId);
    router.push("/workflows");
  }

  return (
    <FadeIn className="space-y-6">
      <FinanceFeedbackToast message={toast} onDismiss={() => setToast(null)} />

      <div className="flex flex-col gap-4 rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7] sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/workflows"
              className="text-[13px] font-semibold text-[#2563EB] hover:underline"
            >
              Workflows
            </Link>
            <span className="text-slate-300">/</span>
            <WorkflowStatusBadge enabled={workflow.enabled} />
          </div>
          <h2 className="text-[24px] font-bold tracking-[-0.03em] text-slate-900">
            {workflow.name}
          </h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-slate-500">
            {workflow.description || "No description"}
          </p>
          <p className="text-[13px] text-slate-500">
            <span className="font-semibold text-slate-800">
              {workflow.runCount}
            </span>{" "}
            runs
            {workflow.lastRunAt
              ? ` · Last ${new Date(workflow.lastRunAt).toLocaleString()}`
              : " · Never run"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <WorkflowEnableToggle
            enabled={workflow.enabled}
            onChange={(enabled) => {
              setWorkflowEnabled(workflow.id, enabled);
              setToast(enabled ? "Workflow enabled" : "Workflow disabled");
            }}
          />
          <button
            type="button"
            onClick={handleTestRun}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#E2E8F0] transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          >
            Test run
          </button>
          <Link
            href={`/workflows/${workflow.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Edit
          </Link>
          <ActionTooltip label="Delete" reason={undefined}>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
            >
              Delete
            </button>
          </ActionTooltip>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Trigger
          </p>
          <p className="mt-3 text-[16px] font-semibold text-slate-900">
            {getTriggerLabel(workflow.trigger.type)}
          </p>
        </section>

        <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Conditions
          </p>
          {workflow.conditions.length === 0 ? (
            <p className="mt-3 text-[14px] text-slate-500">Always run</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {workflow.conditions.map((condition) => (
                <li
                  key={condition.id}
                  className="text-[14px] leading-snug text-slate-700"
                >
                  <span className="font-semibold">
                    {getFieldLabel(workflow.trigger.type, condition.field)}
                  </span>{" "}
                  {CONDITION_OPERATOR_LABELS[condition.operator]}
                  {condition.operator !== "is_empty" &&
                  condition.operator !== "is_not_empty"
                    ? ` “${condition.value}”`
                    : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[18px] bg-white p-5 ring-1 ring-[#EEF2F7]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Actions
          </p>
          <ul className="mt-3 space-y-2">
            {workflow.actions.map((action) => (
              <li key={action.id} className="text-[14px] font-semibold text-slate-800">
                {getActionLabel(action.type)}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-slate-900">
            Run history
          </h3>
          <button
            type="button"
            onClick={handleTestRun}
            className="text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            Run test now
          </button>
        </div>
        <WorkflowRunHistory runs={runs} />
      </section>
    </FadeIn>
  );
}
