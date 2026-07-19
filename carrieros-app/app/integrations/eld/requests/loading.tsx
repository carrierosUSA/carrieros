import EldDirectorySkeleton from "@/components/eld/EldDirectorySkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function EldRequestsLoading() {
  return (
    <OperationalPageShell
      title="ELD connection requests"
      subtitle="Loading requests…"
      eyebrow="Integrations"
    >
      <EldDirectorySkeleton />
    </OperationalPageShell>
  );
}
