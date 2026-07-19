import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import DirectoryClient from "@/components/network/DirectoryClient";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import { listMembers } from "@/lib/network/store";

export default function NetworkDirectoryPage() {
  const members = listMembers();

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Industry directory"
      description="Search verified people and companies by category, location, equipment, language, and trust."
    >
      <NetworkSubNav />
      <FadeIn>
        <DirectoryClient initialMembers={members} />
      </FadeIn>
    </PageShell>
  );
}
