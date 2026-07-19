import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import MessagesClient from "@/components/workforce/MessagesClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  candidateStore,
  companyStore,
  listByTenant,
  messageStore,
  messageThreadStore,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceMessagesPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="Messages"
      description="Employer ↔ candidate threads for recruiting — lightweight inbox, not full Communications."
    >
      <WorkforceSubNav />
      <FadeIn>
        <MessagesClient
          threads={listByTenant(messageThreadStore, tenantId)}
          messages={[...messageStore]}
          candidates={listByTenant(candidateStore, tenantId)}
          companies={listByTenant(companyStore, tenantId)}
        />
      </FadeIn>
    </PageShell>
  );
}
