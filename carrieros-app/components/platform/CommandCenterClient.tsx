import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { getCommandCenterSnapshot } from "@/lib/platform/board";
import type { ExecutiveKpi } from "@/lib/executive/executive-board";

type Snapshot = Awaited<ReturnType<typeof getCommandCenterSnapshot>>;

function toneClass(tone: ExecutiveKpi["tone"] | "info" | "neutral") {
  if (tone === "success") return TRANSPO_COLORS.success;
  if (tone === "warning") return TRANSPO_COLORS.warning;
  if (tone === "critical") return TRANSPO_COLORS.critical;
  if (tone === "disabled") return TRANSPO_COLORS.disabled;
  return TRANSPO_COLORS.info;
}

function KpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const colors = toneClass(kpi.tone);
  return (
    <Link
      href={kpi.href}
      className="rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
    >
      <p className="text-[13px] font-medium text-[#6B7280]">{kpi.label}</p>
      <p className={`mt-2 text-[22px] font-bold tracking-tight ${colors.text}`}>{kpi.value}</p>
      <p className="mt-1 text-[13px] text-[#64748B]">{kpi.detail}</p>
    </Link>
  );
}

export default function CommandCenterClient({ snapshot }: { snapshot: Snapshot }) {
  const { health, kpis } = snapshot;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[14px] text-[#6B7280]">
            {snapshot.companyName} · {snapshot.generatedAtLabel}
          </p>
          <p className="mt-1 text-[14px] text-[#475569]">
            Executive one-screen — live fleet, money, compliance, hiring, and Alph insights.
          </p>
        </div>
        <Link href={snapshot.dashboardHref} className="transpo-btn-primary">
          Full executive dashboard
        </Link>
      </div>

      <section className={`rounded-[16px] p-5 ${TRANSPO_COLORS.info.bg}`}>
        <p className="text-[13px] font-medium text-[#6B7280]">Today&apos;s Operations</p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <p className={`text-[40px] font-bold leading-none ${TRANSPO_COLORS.info.text}`}>
            {health.score}
          </p>
          <p className="pb-1 text-[16px] font-semibold text-[#111827]">{health.label}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {health.drivers.map((d) => (
            <Link
              key={d.label}
              href={d.href}
              className="rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-medium text-[#334155]"
            >
              {d.label}: {d.value}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard kpi={kpis.liveFleet} />
        <KpiCard kpi={kpis.revenue} />
        <KpiCard kpi={kpis.profit} />
        <KpiCard kpi={kpis.cashFlow} />
        <KpiCard kpi={kpis.loads} />
        <KpiCard kpi={kpis.compliance} />
        <KpiCard kpi={kpis.hiring} />
        <KpiCard kpi={kpis.safety} />
        <KpiCard kpi={kpis.fuel} />
        <KpiCard kpi={kpis.maintenance} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[16px] bg-[#F8F9FB] p-5">
          <h2 className="text-[16px] font-semibold text-[#111827]">AI insights</h2>
          {snapshot.aiInsights.length === 0 ? (
            <p className="mt-3 text-[14px] text-[#6B7280]">
              Alph will surface KPI insights here when executive cards include them.{" "}
              <Link href="/alph" className="font-semibold text-[#2563EB]">
                Ask Alph
              </Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {snapshot.aiInsights.map((insight) => (
                <li key={insight.id}>
                  <Link href={insight.href} className="block rounded-[12px] bg-white px-3 py-3">
                    <p className="text-[14px] font-semibold text-[#111827]">{insight.title}</p>
                    <p className="mt-1 text-[13px] text-[#6B7280]">{insight.detail}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[16px] bg-[#F8F9FB] p-5">
          <h2 className="text-[16px] font-semibold text-[#111827]">Industry alerts</h2>
          <ul className="mt-3 space-y-3">
            {snapshot.industryAlerts.map((alert) => {
              const colors = toneClass(alert.tone);
              return (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    className={`block rounded-[12px] px-3 py-3 ${colors.bg}`}
                  >
                    <p className={`text-[14px] font-semibold ${colors.text}`}>{alert.title}</p>
                    <p className="mt-1 text-[13px] text-[#475569]">{alert.detail}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
