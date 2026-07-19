import WorkspaceSoftPanelPage from "@/components/navigation/WorkspaceSoftPanelPage";

type PageProps = {
  params: Promise<{ panel: string }>;
};

export default async function FinanceViewPanelPage({ params }: PageProps) {
  const { panel } = await params;
  return <WorkspaceSoftPanelPage workspace="finance" panelId={panel} />;
}
