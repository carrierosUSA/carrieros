import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AppDetailClient from "@/components/platform/AppDetailClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { getPlatformApp } from "@/lib/platform/store";

type Props = { params: Promise<{ id: string }> };

export default async function PlatformAppDetailPage({ params }: Props) {
  const { id } = await params;
  const app = getPlatformApp(id);
  if (!app) notFound();

  return (
    <PageShell
      eyebrow="Transpo App Store™"
      title={app.name}
      description={app.tagline}
      action={
        <Link href="/platform/apps" className="transpo-btn-secondary">
          Catalog
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <AppDetailClient app={app} />
      </FadeIn>
    </PageShell>
  );
}
