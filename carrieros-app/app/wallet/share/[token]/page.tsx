import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ShareViewClient from "@/components/wallet/ShareViewClient";
import { resolveShareToken } from "@/lib/wallet/store";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function WalletShareTokenPage({ params }: Props) {
  const { token } = await params;
  const view = resolveShareToken(token);

  return (
    <PageShell
      eyebrow="Shared view"
      title="Digital Professional Wallet"
      description="Read-only access granted by the wallet owner — scopes and expiry enforced."
    >
      <FadeIn>
        <ShareViewClient view={view} />
      </FadeIn>
    </PageShell>
  );
}
