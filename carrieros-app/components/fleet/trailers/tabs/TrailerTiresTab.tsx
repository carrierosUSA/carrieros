import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { TrailerTirePosition } from "@/lib/types";

type TrailerTiresTabProps = {
  tires: TrailerTirePosition[];
};

function tireTone(status: TrailerTirePosition["status"]) {
  switch (status) {
    case "replace":
      return CARRIEROS_COLORS.critical;
    case "watch":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.success;
  }
}

export default function TrailerTiresTab({ tires }: TrailerTiresTabProps) {
  const replaceCount = tires.filter((tire) => tire.status === "replace").length;
  const watchCount = tires.filter((tire) => tire.status === "watch").length;

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Tire summary</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Positions</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
              {tires.length}
            </p>
          </div>
          <div
            className={`rounded-[14px] px-4 py-3 ring-1 ${
              watchCount > 0
                ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`
                : "bg-[#F8FAFC] ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">Watch</p>
            <p
              className={`mt-1 text-[22px] font-bold tabular-nums ${
                watchCount > 0 ? CARRIEROS_COLORS.warning.text : "text-slate-950"
              }`}
            >
              {watchCount}
            </p>
          </div>
          <div
            className={`rounded-[14px] px-4 py-3 ring-1 ${
              replaceCount > 0
                ? `${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.border}`
                : "bg-[#F8FAFC] ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">Replace</p>
            <p
              className={`mt-1 text-[22px] font-bold tabular-nums ${
                replaceCount > 0
                  ? CARRIEROS_COLORS.critical.text
                  : "text-slate-950"
              }`}
            >
              {replaceCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Positions</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {tires.map((tire) => {
            const tone = tireTone(tire.status);
            return (
              <li
                key={tire.id}
                className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {tire.position}
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {tire.treadDepthMm} mm tread · {tire.psi} PSI
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                >
                  {tire.status}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
