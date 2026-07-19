import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import AiNetworkingClient from "@/components/network/AiNetworkingClient";

export default async function NetworkAiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? decodeURIComponent(q.replace(/\+/g, " ")) : "";

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="AI Networking"
      description="Alph finds verified people and companies from the directory — heuristics for decision support, never auto-hire."
    >
      <NetworkSubNav />
      <FadeIn>
        <AiNetworkingClient initialQuery={initialQuery} />
      </FadeIn>
    </PageShell>
  );
}
