import AlphCopilotRoleView from "@/components/alph-copilot/AlphCopilotRoleView";
import { getActiveTenantId } from "@/lib/data/tenant";
import { buildAlphExecutiveSummary } from "@/lib/executive/executive-alph";
import { buildExecutiveBoard } from "@/lib/executive/executive-board";

export default async function OwnerAlphPage() {
  const tenantId = getActiveTenantId();
  let briefLines: string[] = [];

  try {
    const board = await buildExecutiveBoard(tenantId);
    const summary = await buildAlphExecutiveSummary(board, tenantId);
    briefLines = [
      ...summary.topPriorities.slice(0, 2).map((i) => i.text),
      ...summary.risks.slice(0, 1).map((i) => i.text),
      ...summary.opportunities.slice(0, 1).map((i) => i.text),
    ].filter(Boolean);
  } catch {
    briefLines = [
      "Executive board unavailable — open the dashboard for the full brief.",
    ];
  }

  return (
    <AlphCopilotRoleView role="owner" ownerBriefLines={briefLines} />
  );
}
