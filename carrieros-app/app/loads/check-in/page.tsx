import DispatchOpsPanel from "@/components/dispatch/DispatchOpsPanel";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function DispatchCheckInPage() {
  return (
    <OperationalPageShell
      title="Check-in / Check-out"
      subtitle="Driver arrivals and departures flow through Communications and the load timeline."
      eyebrow="Dispatch"
    >
      <DispatchOpsPanel
        title="Record check-ins where work already happens"
        description="Use Communications for driver check calls, or open a load to update status and stop times. A dedicated check-in board can land here later."
        primaryHref="/communications"
        primaryLabel="Open Communications"
        secondaryHref="/loads?tab=in_transit"
        secondaryLabel="Active loads"
      />
    </OperationalPageShell>
  );
}
