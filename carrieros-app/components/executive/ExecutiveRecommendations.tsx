import Link from "next/link";
import type { AlphRecommendation } from "@/lib/alph/workspace";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ExecutiveRecommendationsProps = {
  recommendations: AlphRecommendation[];
};

const priorityTone: Record<
  AlphRecommendation["priority"],
  keyof typeof CARRIEROS_COLORS
> = {
  critical: "critical",
  high: "warning",
  medium: "info",
  low: "disabled",
};

const priorityLabel: Record<AlphRecommendation["priority"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function ExecutiveRecommendations({
  recommendations,
}: ExecutiveRecommendationsProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
          Recommended Actions
        </h2>
        <p className="mt-0.5 text-[13px] text-[#64748B]">
          Clear next moves for today — Alph suggests, you decide
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.length === 0 ? (
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-6 text-center ring-1 ring-[#EAEAEA] md:col-span-2 xl:col-span-3">
            <p className="text-[14px] font-medium text-[#64748B]">
              No recommendations right now — operations look steady.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const tone = CARRIEROS_COLORS[priorityTone[rec.priority]];
            return (
              <Link
                key={rec.id}
                href={rec.resolveHref ?? rec.href}
                className="group flex h-full min-h-[120px] flex-col justify-between rounded-[14px] bg-[#F8FAFC] px-4 py-4 ring-1 ring-[#EAEAEA] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:ring-[#BFDBFE] hover:shadow-[0_12px_28px_rgba(37,99,235,0.08)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${tone.bg} ${tone.text}`}
                    >
                      {priorityLabel[rec.priority]}
                    </span>
                    <span className="text-[11px] font-semibold text-[#2563EB] opacity-0 transition group-hover:opacity-100">
                      Open →
                    </span>
                  </div>
                  <p className="mt-2.5 text-[14px] font-semibold leading-snug text-[#0F172A]">
                    {rec.text}
                  </p>
                  <p className="mt-1.5 text-[12px] font-medium leading-snug text-[#64748B]">
                    {rec.reason}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
