import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { getEcosystemMap } from "@/lib/platform/board";

type MapData = ReturnType<typeof getEcosystemMap>;

export default function EcosystemMapClient({ map }: { map: MapData }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">Entire operation</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          One glance across Core, Exchange, Network, Workforce, App Store, Partners, Developers,
          and Automation.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {map.nodes.map((node, index) => {
            const content = (
              <>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[15px] font-semibold text-[#111827]">
                  {node.brand ?? node.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                  {node.description}
                </p>
                <p
                  className={`mt-3 text-[12px] font-semibold ${
                    node.status === "live"
                      ? TRANSPO_COLORS.success.text
                      : TRANSPO_COLORS.disabled.text
                  }`}
                >
                  {node.status === "live" ? "Open" : "Coming online"}
                </p>
              </>
            );

            return node.status === "live" ? (
              <Link
                key={node.id}
                href={node.href}
                className="rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
              >
                {content}
              </Link>
            ) : (
              <div key={node.id} className="rounded-[16px] bg-[#F8F9FB] p-4 opacity-90">
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[16px] bg-white p-5 shadow-[inset_0_0_0_1px_#EEF2F7]">
        <h2 className="text-[16px] font-semibold text-[#111827]">How it connects</h2>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {[
            "Core ops",
            "Workforce + Wallet",
            "App Store + Partners",
            "Developers + Automation",
            "Command + Security",
          ].map((label, i, arr) => (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div className={`flex-1 rounded-[12px] px-3 py-4 text-center text-[13px] font-semibold ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
                {label}
              </div>
              {i < arr.length - 1 ? (
                <span className="hidden text-[#94A3B8] lg:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-[#6B7280]">
          Platform orchestrates Core, Exchange, Network, Workforce, Wallet, App Store, Partners,
          Developers, and Automation without rebuilding ops modules.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <h3 className="text-[15px] font-semibold text-[#111827]">Live core modules</h3>
          <ul className="mt-3 space-y-2">
            {map.coreLive.map((mod) => (
              <li key={mod.id}>
                <Link
                  href={mod.href}
                  className="flex items-center justify-between rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px] font-medium text-[#111827] hover:bg-[#EFF6FF]"
                >
                  {mod.title}
                  <span className={`text-[12px] font-semibold ${TRANSPO_COLORS.success.text}`}>
                    Live
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-[15px] font-semibold text-[#111827]">Coming online</h3>
          {map.coreComing.length === 0 ? (
            <p className="mt-3 text-[14px] text-[#6B7280]">All mapped modules are live.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {map.coreComing.map((mod) => (
                <li
                  key={mod.id}
                  className="flex items-center justify-between rounded-[12px] bg-[#F8F9FB] px-3 py-2.5 text-[14px] font-medium text-[#64748B]"
                >
                  {mod.title}
                  <span className={`text-[12px] font-semibold ${TRANSPO_COLORS.disabled.text}`}>
                    Soon
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
