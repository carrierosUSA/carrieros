import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  PARTNER_LEVEL_LABELS,
  type PlatformPartner,
} from "@/lib/platform/types";

const PANELS = [
  "Partner Dashboard",
  "Analytics",
  "Lead Management",
  "API Access",
  "Integration Status",
  "Support",
  "Marketing Assets",
  "Certification Program",
] as const;

export default function PartnerDetailClient({ partner }: { partner: PlatformPartner }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[16px] bg-[#F8F9FB] p-5">
        <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${TRANSPO_COLORS.info.text}`}>
          {PARTNER_LEVEL_LABELS[partner.level]} · {partner.category}
        </p>
        <h2 className="mt-2 text-[20px] font-bold text-[#111827]">{partner.name}</h2>
        <p className="mt-2 max-w-2xl text-[14px] text-[#475569]">{partner.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`mailto:${partner.contactEmail}`} className="transpo-btn-primary">
            Contact partner
          </a>
          <Link href="/platform/partners" className="transpo-btn-secondary">
            All partners
          </Link>
          <Link href="/platform/developers" className="transpo-btn-secondary">
            API Access
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Impressions", value: partner.analytics.impressions.toLocaleString() },
          { label: "Leads", value: String(partner.analytics.leads) },
          { label: "Conversions", value: String(partner.analytics.conversions) },
          { label: "API calls (30d)", value: partner.analytics.apiCalls30d.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[16px] bg-white p-4 shadow-[inset_0_0_0_1px_#EEF2F7]">
            <p className="text-[13px] font-medium text-[#6B7280]">{stat.label}</p>
            <p className="mt-2 text-[22px] font-bold text-[#111827]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {PANELS.map((panel) => (
          <section key={panel} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <h3 className="text-[14px] font-semibold text-[#111827]">{panel}</h3>
            {panel === "Lead Management" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                {partner.leadsOpen} open leads in queue. Assign from Support or Marketing.
              </p>
            ) : null}
            {panel === "API Access" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                Access level: <strong>{partner.apiAccess}</strong>. Manage keys in Developer Platform.
              </p>
            ) : null}
            {panel === "Integration Status" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                Status: <strong>{partner.integrationStatus.replace("_", " ")}</strong> ·{" "}
                {partner.certification}
              </p>
            ) : null}
            {panel === "Marketing Assets" ? (
              <ul className="mt-2 space-y-1">
                {partner.marketingAssets.map((asset) => (
                  <li key={asset} className="text-[14px] text-[#475569]">
                    · {asset}
                  </li>
                ))}
              </ul>
            ) : null}
            {panel === "Certification Program" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                Current badge: {partner.certification}. Renew annually to keep Transpo Verified listing.
              </p>
            ) : null}
            {panel === "Partner Dashboard" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                Region {partner.region}. Primary contact {partner.contactEmail}.
              </p>
            ) : null}
            {panel === "Analytics" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                Conversion rate{" "}
                {partner.analytics.leads
                  ? Math.round((partner.analytics.conversions / partner.analytics.leads) * 100)
                  : 0}
                % from tracked leads (seed analytics).
              </p>
            ) : null}
            {panel === "Support" ? (
              <p className="mt-2 text-[14px] text-[#475569]">
                Partner support lane via Transpo Support · escalate integration blockers from here.
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
