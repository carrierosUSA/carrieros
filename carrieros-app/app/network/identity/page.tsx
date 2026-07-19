import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import IdentityClient from "@/components/network/IdentityClient";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import { getOwnerMember } from "@/lib/network/store";
import {
  seedBadges,
  seedPassport,
  seedTrustScore,
} from "@/lib/network/seed";

export default function NetworkIdentityPage() {
  const member = getOwnerMember();

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="My Identity"
      description="Universal Verified ID, Transpo ID, QR, and badges — lifetime professional identity linked to Career Passport."
    >
      <NetworkSubNav />
      <FadeIn>
        <IdentityClient
          member={member}
          passport={seedPassport}
          badges={seedBadges}
          trust={seedTrustScore}
        />
      </FadeIn>
    </PageShell>
  );
}
