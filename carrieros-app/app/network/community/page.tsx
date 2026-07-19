import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import CommunityClient from "@/components/network/CommunityClient";
import { listCommunityPosts } from "@/lib/network/store";

export default function NetworkCommunityPage() {
  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Community"
      description="Updates, hiring, promotions, training, and education from verified businesses."
    >
      <NetworkSubNav />
      <FadeIn>
        <CommunityClient initial={listCommunityPosts()} />
      </FadeIn>
    </PageShell>
  );
}
