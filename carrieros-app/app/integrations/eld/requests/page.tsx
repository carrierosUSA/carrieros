import { Suspense } from "react";
import EldDirectorySkeleton from "@/components/eld/EldDirectorySkeleton";
import EldRequestsClient from "@/components/eld/EldRequestsClient";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function EldRequestsPage() {
  return (
    <OperationalPageShell
      title="ELD connection requests"
      subtitle="Track Submitted through Connected — with clear rejection reasons when a request cannot proceed."
      eyebrow="Integrations"
    >
      <Suspense fallback={<EldDirectorySkeleton />}>
        <EldRequestsClient />
      </Suspense>
    </OperationalPageShell>
  );
}
