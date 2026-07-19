import EldDirectorySkeleton from "@/components/eld/EldDirectorySkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function EldDirectoryLoading() {
  return (
    <OperationalPageShell
      title="ELD Directory"
      subtitle="Loading providers…"
      eyebrow="Integrations"
    >
      <EldDirectorySkeleton />
    </OperationalPageShell>
  );
}
