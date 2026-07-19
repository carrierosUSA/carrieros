import WorkspaceSoftPanelPage from "@/components/navigation/WorkspaceSoftPanelPage";

type PageProps = {
  params: Promise<{ panel: string }>;
};

export default async function DriversViewPanelPage({ params }: PageProps) {
  const { panel } = await params;
  return <WorkspaceSoftPanelPage workspace="drivers" panelId={panel} />;
}
