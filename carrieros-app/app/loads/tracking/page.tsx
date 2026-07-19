import DispatchOpsPanel from "@/components/dispatch/DispatchOpsPanel";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

type TrackingPageProps = {
  searchParams: Promise<{ focus?: string }>;
};

export default async function DispatchTrackingPage({
  searchParams,
}: TrackingPageProps) {
  const params = await searchParams;
  const etaFocus = params.focus === "eta";

  return (
    <OperationalPageShell
      title={etaFocus ? "ETA" : "Tracking"}
      subtitle={
        etaFocus
          ? "Check live ETAs from active loads and open a load for the full track."
          : "Follow trucks in motion from active loads — open any load for live tracking."
      }
      eyebrow="Dispatch"
    >
      <DispatchOpsPanel
        title={etaFocus ? "ETAs live on active loads" : "Track from active loads"}
        description={
          etaFocus
            ? "Open an in-transit load to see ETA, last ping, and driver check-ins. Alph can summarize delays when you ask."
            : "Load-level tracking and replay stay on each load. Start from Active loads, then open Tracking on the load you care about."
        }
        primaryHref="/loads?tab=in_transit"
        primaryLabel="Active loads"
        secondaryHref="/communications"
        secondaryLabel="Check-ins & comms"
      />
    </OperationalPageShell>
  );
}
