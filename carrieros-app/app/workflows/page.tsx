import { Suspense } from "react";
import Link from "next/link";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import WorkflowDashboardClient from "@/components/workflows/WorkflowDashboardClient";
import WorkflowDashboardSkeleton from "@/components/workflows/WorkflowDashboardSkeleton";

export default function WorkflowsPage() {
  return (
    <OperationalPageShell
      title="Workflows"
      subtitle="Automate Trigger → Condition → Action without code. Unlimited workflows."
      eyebrow="Automation"
      action={
        <Link
          href="/workflows/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          + New workflow
        </Link>
      }
    >
      <Suspense fallback={<WorkflowDashboardSkeleton />}>
        <WorkflowDashboardClient />
      </Suspense>
    </OperationalPageShell>
  );
}
