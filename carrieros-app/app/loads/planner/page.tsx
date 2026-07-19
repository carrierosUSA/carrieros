import DispatchOpsPanel from "@/components/dispatch/DispatchOpsPanel";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function DispatchPlannerPage() {
  return (
    <OperationalPageShell
      title="Planner"
      subtitle="Plan coverage from the board — assign drivers and equipment without leaving Dispatch."
      eyebrow="Dispatch"
    >
      <DispatchOpsPanel
        title="Use the load board to plan the day"
        description="A dedicated planner view is coming. Until then, Board shows upcoming and assigned loads so you can cover freight from one place."
        primaryHref="/loads?tab=assigned"
        primaryLabel="Open upcoming loads"
        secondaryHref="/loads"
        secondaryLabel="Full board"
      />
    </OperationalPageShell>
  );
}
