import Link from "next/link";
import {
  Boxes,
  Command,
  FileText,
  Landmark,
  Network,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
  Users,
  Workflow,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  CORE_PLATFORM_MODULES,
  PLATFORM_HUB_TILES,
} from "@/lib/platform/catalog";
import { PLATFORM_VOICE_COMMANDS } from "@/lib/platform/seed";
import type { getPlatformHomeSnapshot } from "@/lib/platform/board";

type Snapshot = Awaited<ReturnType<typeof getPlatformHomeSnapshot>>;

const tileIcons: Record<string, typeof Store> = {
  core: Command,
  exchange: Boxes,
  network: Network,
  workforce: Users,
  apps: Store,
  partners: Users,
  developers: Sparkles,
  automation: Workflow,
  command: Command,
  migration: Upload,
  security: Shield,
  foundation: Landmark,
  "trust-charter": ShieldCheck,
  constitution: Scale,
  "ai-policy": FileText,
};

export default function PlatformHomeClient({ snapshot }: { snapshot: Snapshot }) {
  const { health, counts } = snapshot;

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-[16px] p-4 ${TRANSPO_COLORS.info.bg}`}>
          <p className="text-[13px] font-medium text-[#6B7280]">Today&apos;s Operations</p>
          <p className={`mt-2 text-[28px] font-bold tracking-tight ${TRANSPO_COLORS.info.text}`}>
            {health.score}
          </p>
          <p className="mt-1 text-[14px] font-medium text-[#111827]">{health.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {health.drivers.map((d) => (
              <Link
                key={d.label}
                href={d.href}
                className="rounded-full bg-white/80 px-2.5 py-1 text-[12px] font-medium text-[#334155]"
              >
                {d.label} {d.value}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Live ops</p>
          <p className="mt-2 text-[28px] font-bold text-[#111827]">{counts.loadsToday}</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Loads · {counts.trucksAvailable} trucks · {counts.driversAvailable} drivers
          </p>
          <Link href="/loads" className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]">
            Open dispatch
          </Link>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Transpo App Store™</p>
          <p className="mt-2 text-[28px] font-bold text-[#111827]">{snapshot.installedApps}</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Installed of {snapshot.catalogApps} catalog apps
          </p>
          <Link
            href="/platform/apps"
            className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]"
          >
            Manage apps
          </Link>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="text-[13px] font-medium text-[#6B7280]">Automation</p>
          <p className="mt-2 text-[28px] font-bold text-[#111827]">{snapshot.enabledRecipes}</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Recipes on · {snapshot.partnersLive} live partners
          </p>
          <Link
            href="/platform/automation"
            className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]"
          >
            Open recipes
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Platform destinations</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Run your entire operation here — one click to each surface.
            </p>
          </div>
          <Link href="/alph" className="transpo-btn-primary shrink-0">
            Ask Alph
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {PLATFORM_HUB_TILES.map((tile) => {
            const Icon = tileIcons[tile.id] ?? Command;
            return (
              <Link
                key={tile.id}
                href={tile.href}
                className="group rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#2563EB]">
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <p className="mt-3 text-[14px] font-semibold text-[#111827] group-hover:text-[#2563EB]">
                  {tile.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#6B7280]">{tile.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="core-map">
        <h2 className="text-[16px] font-semibold text-[#111827]">Core Platform map</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Links into modules you already use — no rebuilds.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CORE_PLATFORM_MODULES.map((mod) =>
            mod.status === "live" ? (
              <Link
                key={mod.id}
                href={mod.href}
                className="rounded-[16px] bg-white p-4 shadow-[inset_0_0_0_1px_#EEF2F7] transition hover:shadow-[inset_0_0_0_1px_#BFDBFE]"
              >
                <p className="text-[14px] font-semibold text-[#111827]">{mod.title}</p>
                <p className="mt-1 text-[13px] text-[#6B7280]">{mod.description}</p>
                <p className={`mt-3 text-[12px] font-semibold ${TRANSPO_COLORS.success.text}`}>
                  Open
                </p>
              </Link>
            ) : (
              <div
                key={mod.id}
                className="rounded-[16px] bg-[#F8F9FB] p-4"
              >
                <p className="text-[14px] font-semibold text-[#111827]">{mod.title}</p>
                <p className="mt-1 text-[13px] text-[#6B7280]">{mod.description}</p>
                <p className={`mt-3 text-[12px] font-semibold ${TRANSPO_COLORS.disabled.text}`}>
                  {mod.ctaLabel ?? "Coming online"}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="rounded-[16px] bg-[#EFF6FF] px-5 py-5">
        <h2 className="text-[16px] font-semibold text-[#1E40AF]">
          Built on Transpo.ai Foundation
        </h2>
        <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-[#1D4ED8]/90">
          Charter is supreme on trust and safety. Foundation guides how we
          build. Constitution and AI Safety Policy implement day-to-day rules.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/platform/foundation"
            className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#2563EB]"
          >
            Foundation
          </Link>
          <Link
            href="/platform/trust-charter"
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Trust Charter
          </Link>
          <Link
            href="/platform/constitution"
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Constitution
          </Link>
          <Link
            href="/platform/ai-policy"
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            AI Safety Policy
          </Link>
        </div>
      </section>

      <section id="voice-os" className="rounded-[16px] bg-[#F8F9FB] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-[16px] font-semibold text-[#111827]">Voice Operating System</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Alph understands platform commands — create loads, find drivers, pay invoices,
              schedule maintenance, and open Platform surfaces.
            </p>
            <Link href="/alph" className="transpo-btn-secondary mt-4 inline-flex">
              Open Alph voice
            </Link>
          </div>
          <ul className="grid flex-1 gap-2 sm:grid-cols-2">
            {PLATFORM_VOICE_COMMANDS.map((cmd) => (
              <li
                key={cmd}
                className="rounded-[12px] bg-white px-3 py-2.5 text-[13px] font-medium text-[#334155]"
              >
                “{cmd}”
              </li>
            ))}
          </ul>
        </div>
      </section>

      {snapshot.comingCore > 0 ? (
        <EmptyState
          title="Some modules still coming online"
          description="Live modules are linked above. Coming-soon cards stay calm until those routes ship."
          actionLabel="View ecosystem map"
          actionHref="/platform/ecosystem"
        />
      ) : null}
    </div>
  );
}
