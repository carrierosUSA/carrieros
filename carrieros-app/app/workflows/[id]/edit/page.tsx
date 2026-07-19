import OperationalPageShell from "@/components/premium/OperationalPageShell";
import WorkflowBuilderClient from "@/components/workflows/WorkflowBuilderClient";

type EditWorkflowPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkflowPage({
  params,
}: EditWorkflowPageProps) {
  const { id } = await params;

  return (
    <OperationalPageShell
      title="Edit workflow"
      subtitle="Update trigger, conditions, and actions."
      eyebrow="Automation"
    >
      <WorkflowBuilderClient mode="edit" workflowId={id} />
    </OperationalPageShell>
  );
}
