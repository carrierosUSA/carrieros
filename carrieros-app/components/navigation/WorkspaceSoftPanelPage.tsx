import { notFound } from "next/navigation";
import WorkspaceSoftPanel from "@/components/navigation/WorkspaceSoftPanel";
import { getWorkspaceSoftPanel } from "@/lib/navigation/workspace-panels";

const EYEBROWS: Record<string, string> = {
  dispatch: "Dispatch",
  drivers: "Drivers",
  fleet: "Fleet",
  finance: "Finance",
  customers: "Customers",
  reports: "Reports",
  advanced: "Advanced",
};

type WorkspaceSoftPanelPageProps = {
  workspace: string;
  panelId: string;
};

export default function WorkspaceSoftPanelPage({
  workspace,
  panelId,
}: WorkspaceSoftPanelPageProps) {
  const panel = getWorkspaceSoftPanel(workspace, panelId);
  if (!panel) notFound();

  return (
    <WorkspaceSoftPanel
      panel={panel}
      eyebrow={EYEBROWS[workspace] ?? "Workspace"}
    />
  );
}
