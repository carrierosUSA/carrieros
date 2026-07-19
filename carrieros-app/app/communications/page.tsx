import { Suspense } from "react";
import CommunicationsShell from "@/components/communications/CommunicationsShell";
import CommunicationsSkeleton from "@/components/communications/CommunicationsSkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { listCommunications } from "@/lib/communications";

export const dynamic = "force-dynamic";

export default function CommunicationsPage() {
  const records = listCommunications();

  return (
    <OperationalPageShell
      title="Communications"
      subtitle="Voice, SMS, email, and internal chat — every message linked to a load, driver, or partner."
      eyebrow="Communication Center"
    >
      <Suspense fallback={<CommunicationsSkeleton />}>
        <CommunicationsShell initialRecords={records} />
      </Suspense>
    </OperationalPageShell>
  );
}
