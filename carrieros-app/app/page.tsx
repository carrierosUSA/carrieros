import { Suspense } from "react";
import AlphWorkspace from "@/components/alph/AlphWorkspace";
import { getCurrentSession } from "@/lib/auth/session";
import { getActiveTenantId } from "@/lib/data/tenant";
import { buildAlphExecutiveSummary } from "@/lib/executive/executive-alph";
import { buildExecutiveBoard } from "@/lib/executive/executive-board";
import { greetingForNow } from "@/lib/alph/workspace";
import type { WorkspaceId } from "@/lib/navigation/workspace-panels";

export const dynamic = "force-dynamic";

const WORKSPACE_IDS = new Set<WorkspaceId>([
  "home",
  "dispatch",
  "drivers",
  "fleet",
  "documents",
  "finance",
  "customers",
  "reports",
  "alph",
  "settings",
]);

type HomePageProps = {
  searchParams: Promise<{ workspace?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const session = getCurrentSession();
  const workspaceId =
    params.workspace && WORKSPACE_IDS.has(params.workspace as WorkspaceId)
      ? (params.workspace as WorkspaceId)
      : undefined;

  let board;
  let summary;

  try {
    board = await buildExecutiveBoard(tenantId);
    summary = await buildAlphExecutiveSummary(board, tenantId);
  } catch (error) {
    console.error("[Alph workspace] failed to load board", error);
    return (
      <div className="w-full rounded-[16px] bg-white p-6 text-[#111827]">
        <h1 className="text-[24px] font-bold">Alph</h1>
        <p className="mt-2 text-[14px] text-slate-600">
          Alph could not load your workspace data just now. Refresh the page, or
          open Home while we recover.
        </p>
        <a
          href="/dashboard"
          className="mt-4 inline-flex rounded-full bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white"
        >
          Open Home
        </a>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[16px] bg-white p-3 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1280px]">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-[16px] bg-[#F5F7FA]" />}>
          <AlphWorkspace
            board={board}
            summary={summary}
            userName={session.name}
            greeting={greetingForNow(session.name)}
            workspaceId={workspaceId}
          />
        </Suspense>
      </div>
    </div>
  );
}
