import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PublicProfileClient from "@/components/network/PublicProfileClient";
import {
  getBusinessPassport,
  getMemberByTranspoId,
  getProfessionalPassport,
  getReputationSummary,
} from "@/lib/network/store";

export default async function NetworkPublicProfilePage({
  params,
}: {
  params: Promise<{ transpoId: string }>;
}) {
  const { transpoId } = await params;
  const member = getMemberByTranspoId(transpoId) ?? null;

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title={member?.displayName ?? "Public profile"}
      description="Consent-based public identity card powered by Transpo ID."
    >
      <FadeIn>
        <PublicProfileClient
          member={member}
          professional={
            member ? getProfessionalPassport(member.id) : undefined
          }
          business={member ? getBusinessPassport(member.id) : undefined}
          reputation={member ? getReputationSummary(member.id) : undefined}
        />
      </FadeIn>
    </PageShell>
  );
}
