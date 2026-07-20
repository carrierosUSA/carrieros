import Link from "next/link";
import AlphActionHistoryClient from "@/components/alph/AlphActionHistoryClient";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { listAlphAudit } from "@/lib/alph/audit";
import { getCurrentSession } from "@/lib/auth/session";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function AlphActionHistoryPage() {
  const session = getCurrentSession();
  const entries = listAlphAudit({
    companyId: session.companyId,
    tenantId: getActiveTenantId(),
    limit: 80,
  });

  return (
    <OperationalPageShell
      title="Alph action history"
      subtitle="Prompts, drafts, approvals, and executions — company-scoped audit trail."
      eyebrow="Alph"
      action={
        <Link
          href="/settings?section=ai-policy"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Autopilot settings
        </Link>
      }
    >
      <AlphActionHistoryClient initialEntries={entries} />
    </OperationalPageShell>
  );
}
