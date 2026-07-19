import OperationalPageShell from "@/components/premium/OperationalPageShell";
import WorkflowBuilderClient from "@/components/workflows/WorkflowBuilderClient";

export default function NewWorkflowPage() {
  return (
    <OperationalPageShell
      title="New workflow"
      subtitle="Build a Trigger → Condition → Action automation in three steps."
      eyebrow="Automation"
    >
      <WorkflowBuilderClient mode="create" />
    </OperationalPageShell>
  );
}
