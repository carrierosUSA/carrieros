import DispatchOpsPanel from "@/components/dispatch/DispatchOpsPanel";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function DispatchDetentionPage() {
  return (
    <OperationalPageShell
      title="Detention"
      subtitle="Spot detention risk from active stops and escalate from the load."
      eyebrow="Dispatch"
    >
      <DispatchOpsPanel
        title="Review detention from the board"
        description="Open Active or Delivered loads to review dwell and detention notes on the load timeline. Ask Alph for loads at risk of detention."
        primaryHref="/loads?tab=in_transit"
        primaryLabel="Active loads"
        secondaryHref="/"
        secondaryLabel="Ask Alph"
      />
    </OperationalPageShell>
  );
}
