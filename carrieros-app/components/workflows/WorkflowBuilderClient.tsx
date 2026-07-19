"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FadeIn from "@/components/ui/FadeIn";
import FinanceFeedbackToast from "@/components/finance/FinanceFeedbackToast";
import WorkflowBuilder from "@/components/workflows/WorkflowBuilder";
import {
  createWorkflow,
  draftFromWorkflow,
  emptyWorkflowDraft,
  getWorkflowById,
  hydrateWorkflowStore,
  isWorkflowDraftComplete,
  updateWorkflow,
} from "@/lib/data/workflow-store";
import type { WorkflowDraft } from "@/lib/workflows/types";

type WorkflowBuilderClientProps = {
  mode: "create" | "edit";
  workflowId?: string;
};

export default function WorkflowBuilderClient({
  mode,
  workflowId,
}: WorkflowBuilderClientProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkflowDraft>(emptyWorkflowDraft);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    hydrateWorkflowStore();
    if (mode === "edit" && workflowId) {
      const existing = getWorkflowById(workflowId);
      if (!existing) {
        setMissing(true);
      } else {
        setDraft(draftFromWorkflow(existing));
      }
    }
    setHydrated(true);
  }, [mode, workflowId]);

  const validation = useMemo(() => isWorkflowDraftComplete(draft), [draft]);

  function handleSave() {
    if (!validation.complete) return;
    if (mode === "edit" && workflowId) {
      updateWorkflow(workflowId, draft);
      setToast("Workflow updated");
      router.push(`/workflows/${workflowId}`);
      return;
    }
    const created = createWorkflow(draft);
    setToast("Workflow created");
    router.push(`/workflows/${created.id}`);
  }

  if (!hydrated) {
    return (
      <div className="h-48 animate-pulse rounded-[18px] bg-[#F5F7FA]" />
    );
  }

  if (missing) {
    return (
      <FadeIn className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">
          Workflow not found
        </p>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <FinanceFeedbackToast message={toast} onDismiss={() => setToast(null)} />
      <WorkflowBuilder
        draft={draft}
        onChange={setDraft}
        onSave={handleSave}
        onCancel={() =>
          router.push(
            mode === "edit" && workflowId
              ? `/workflows/${workflowId}`
              : "/workflows",
          )
        }
        saveDisabled={!validation.complete}
        saveDisabledReason={validation.reason}
        saveLabel={mode === "edit" ? "Save changes" : "Create workflow"}
      />
    </FadeIn>
  );
}
