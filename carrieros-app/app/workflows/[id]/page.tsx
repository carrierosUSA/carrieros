import OperationalPageShell from "@/components/premium/OperationalPageShell";
import WorkflowDetailClient from "@/components/workflows/WorkflowDetailClient";

type WorkflowDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkflowDetailPage({
  params,
}: WorkflowDetailPageProps) {
  const { id } = await params;

  return (
    <OperationalPageShell
      title="Workflow"
      subtitle="Review configuration, run history, and test execution."
      eyebrow="Automation"
    >
      <WorkflowDetailClient workflowId={id} />
    </OperationalPageShell>
  );
}
