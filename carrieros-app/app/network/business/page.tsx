import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import BusinessListClient from "@/components/network/BusinessListClient";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import { listBusinessPassports, listMembers } from "@/lib/network/store";

export default function NetworkBusinessPage() {
  const companies = listMembers().filter((m) => m.kind === "company");
  const passports = listBusinessPassports();

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Business Passport"
      description="Company authority, fleet, safety, insurance, certifications, and partner trust — in one passport."
    >
      <NetworkSubNav />
      <FadeIn>
        <BusinessListClient companies={companies} passports={passports} />
      </FadeIn>
    </PageShell>
  );
}
