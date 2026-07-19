import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { WorkforceKpi } from "@/lib/workforce/board";

export default function WorkforceKpiStrip({ kpis }: { kpis: WorkforceKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => {
        const tone = kpi.tone ? TRANSPO_COLORS[kpi.tone] : null;
        return (
          <div
            key={kpi.id}
            className={`flex h-full min-h-[88px] flex-col justify-between rounded-[12px] px-4 py-3 ${
              tone ? tone.bg : "bg-[#F8F9FB]"
            }`}
          >
            <p className="text-[12px] font-medium text-[#6B7280]">{kpi.label}</p>
            <p
              className={`text-[24px] font-bold tracking-[-0.02em] ${
                tone ? tone.text : "text-[#111827]"
              }`}
            >
              {kpi.value}
            </p>
            <p className="text-[12px] text-[#6B7280]">{kpi.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
