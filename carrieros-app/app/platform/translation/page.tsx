import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import TranslationClient from "@/components/platform/TranslationClient";

export default function PlatformTranslationPage() {
  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Global Translation"
      description="Set a preferred language and preview Alph-style translations for chat, documents, jobs, and invoices."
    >
      <PlatformSubNav />
      <FadeIn>
        <TranslationClient />
      </FadeIn>
    </PageShell>
  );
}
