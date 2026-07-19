import { notFound } from "next/navigation";
import AdvancedCategoryPanel from "@/components/advanced/AdvancedCategoryPanel";
import WorkspaceSoftPanelPage from "@/components/navigation/WorkspaceSoftPanelPage";
import { getAdvancedCategory } from "@/lib/navigation/daily-use";
import { getWorkspaceSoftPanel } from "@/lib/navigation/workspace-panels";

type PageProps = {
  params: Promise<{ panel: string }>;
};

export default async function AdvancedViewPanelPage({ params }: PageProps) {
  const { panel } = await params;
  const category = getAdvancedCategory(panel);
  if (category) {
    return <AdvancedCategoryPanel category={category} />;
  }

  if (!getWorkspaceSoftPanel("advanced", panel)) {
    notFound();
  }

  return <WorkspaceSoftPanelPage workspace="advanced" panelId={panel} />;
}
