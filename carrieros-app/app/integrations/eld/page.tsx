import { Suspense } from "react";
import EldDirectoryClient from "@/components/eld/EldDirectoryClient";
import EldDirectorySkeleton from "@/components/eld/EldDirectorySkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function EldDirectoryPage() {
  return (
    <OperationalPageShell
      title="ELD Directory"
      subtitle="See which ELDs are connected, which need partnership, and what to do when there is no public API — never a dead end."
      eyebrow="Integrations"
    >
      <Suspense fallback={<EldDirectorySkeleton />}>
        <EldDirectoryClient />
      </Suspense>
    </OperationalPageShell>
  );
}
