import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  PARTNER_LEVEL_LABELS,
  type PlatformPartner,
} from "@/lib/platform/types";

const LEVEL_TONE: Record<string, string> = {
  platinum: TRANSPO_COLORS.info.text,
  gold: TRANSPO_COLORS.warning.text,
  enterprise: TRANSPO_COLORS.success.text,
  verified: TRANSPO_COLORS.info.text,
  technology: TRANSPO_COLORS.info.text,
  manufacturer: TRANSPO_COLORS.warning.text,
  government: TRANSPO_COLORS.critical.text,
  registered: TRANSPO_COLORS.disabled.text,
};

export default function PartnersClient({ partners }: { partners: PlatformPartner[] }) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Partner levels from Registered to Enterprise, Technology, Manufacturer, and Government —
        each with dashboard, leads, API access, and certification status.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <Link
            key={partner.id}
            href={`/platform/partners/${partner.id}`}
            className="rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${LEVEL_TONE[partner.level] ?? TRANSPO_COLORS.disabled.text}`}>
                  {PARTNER_LEVEL_LABELS[partner.level]}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-[#111827]">{partner.name}</h3>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">{partner.category}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#64748B]">
                {partner.integrationStatus.replace("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-[#475569]">{partner.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-[12px] font-medium text-[#64748B]">
              <span>{partner.leadsOpen} open leads</span>
              <span>{partner.analytics.apiCalls30d.toLocaleString()} API / 30d</span>
              <span>{partner.region}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
