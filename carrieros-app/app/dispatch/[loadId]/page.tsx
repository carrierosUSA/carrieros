import LoadDetailWorkspace from "./LoadDetailWorkspace";
export default async function LoadDetailPage({ params }: { params: Promise<{ loadId: string }> }) { const { loadId } = await params; return <LoadDetailWorkspace loadId={loadId} />; }
