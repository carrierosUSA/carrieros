import Link from "next/link";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import type { AdvancedCategory } from "@/lib/navigation/daily-use";

type AdvancedCategoryPanelProps = {
  category: AdvancedCategory;
};

export default function AdvancedCategoryPanel({
  category,
}: AdvancedCategoryPanelProps) {
  return (
    <OperationalPageShell
      title={category.name}
      subtitle={category.description}
      eyebrow="Advanced"
      action={
        <Link
          href="/settings"
          className="text-[13px] font-semibold text-[#2563EB]"
        >
          Company Settings →
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {category.links.map((link) => (
          <Link
            key={link.href + link.name}
            href={link.href}
            className="rounded-[16px] bg-[#F8FAFC] px-5 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.08)]"
          >
            <h2 className="text-[15px] font-semibold text-[#0F172A]">
              {link.name}
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-[#6B7280]">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </OperationalPageShell>
  );
}
