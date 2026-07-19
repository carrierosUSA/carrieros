import FleetSubNav from "@/components/fleet/FleetSubNav";
import WorkspaceSoftPanelPage from "@/components/navigation/WorkspaceSoftPanelPage";

type PageProps = {
  params: Promise<{ panel: string }>;
};

export default async function FleetViewPanelPage({ params }: PageProps) {
  const { panel } = await params;
  return (
    <div className="space-y-4">
      <FleetSubNav />
      <WorkspaceSoftPanelPage workspace="fleet" panelId={panel} />
    </div>
  );
}
