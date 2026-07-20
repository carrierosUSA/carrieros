import ExecutiveDashboardClient from "@/components/executive/ExecutiveDashboardClient";
import { getCurrentSession } from "@/lib/auth/session";
import { greetingForNow } from "@/lib/alph/workspace";
import { buildAlphExecutiveSummary } from "@/lib/executive/executive-alph";
import { buildExecutiveBoard } from "@/lib/executive/executive-board";
import { buildHomeCommandCenter } from "@/lib/executive/home-command-center";
import { getActiveTenantId } from "@/lib/data/tenant";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tenantId = getActiveTenantId();
  const session = getCurrentSession();

  try {
    const board = await buildExecutiveBoard(tenantId);
    const summary = await buildAlphExecutiveSummary(board, tenantId);
    const home = await buildHomeCommandCenter(board, summary, tenantId);

    return (
      <div className="w-full bg-white p-3 text-[#111827] sm:p-5 lg:p-6">
        <div className="mx-auto max-w-[1280px]">
          <ExecutiveDashboardClient
            data={{
              home,
              greeting: greetingForNow(session.name),
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("[Dashboard] failed to load", error);
    return (
      <div className="w-full rounded-[16px] bg-white p-6 text-[#111827]">
        <h1 className="text-[22px] font-bold">Home</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">
          Home data could not be loaded. Refresh to try again, or ask Alph for a
          summary.
        </p>
        <a href="/" className="transpo-btn-primary mt-4 inline-flex text-[14px]">
          Open Alph
        </a>
      </div>
    );
  }
}
