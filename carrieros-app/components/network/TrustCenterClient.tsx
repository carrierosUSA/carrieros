import Link from "next/link";
import TrustScoreCard from "@/components/network/TrustScoreCard";
import { NetworkStatusBadge } from "@/components/network/NetworkStatusBadge";
import { seedTrustScore } from "@/lib/network/seed";
import type {
  NetworkAuditEntry,
  TrustStatusItem,
  TrustTimelineEvent,
} from "@/lib/network/types";

export default function TrustCenterClient({
  status,
  timeline,
  audit,
}: {
  status: TrustStatusItem[];
  timeline: TrustTimelineEvent[];
  audit: NetworkAuditEntry[];
}) {
  return (
    <div className="space-y-6">
      <p className="text-[14px] leading-relaxed text-[#6B7280]">
        Network Trust Center surfaces identity, insurance, authority, document, safety,
        training, and compliance signals. Access is consent-based and audited. Sensitive
        Wallet records use encryption at rest. Trust Score is decision support only —
        never an automatic approve/reject gate.
      </p>

      <div className="flex flex-wrap gap-2">
        <Link href="/network/identity" className="transpo-btn-primary text-[13px]">
          My Identity
        </Link>
        <Link
          href="/wallet/trust"
          className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-[#F8F9FB]"
        >
          Wallet Trust Score
        </Link>
        <Link
          href="/workforce"
          className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-[#F8F9FB]"
        >
          Workforce
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrustScoreCard
          score={seedTrustScore.score}
          disclaimer={seedTrustScore.disclaimer}
          factors={seedTrustScore.factors}
        />
        <div className="space-y-2 lg:col-span-2">
          {status.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {item.label}
                  </p>
                  <NetworkStatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-[13px] text-[#6B7280]">{item.detail}</p>
              </div>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-[13px] font-medium text-[#2563EB]"
                >
                  Open
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Trust timeline</h3>
        <ol className="space-y-2">
          {timeline.map((t) => (
            <li key={t.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">
                  {new Date(t.at).toLocaleString()}
                </span>
                <NetworkStatusBadge status="healthy" label={t.kind} />
              </div>
              <p className="mt-1 text-[14px] font-semibold text-[#111827]">
                {t.title}
              </p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{t.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Audit history</h3>
        <div className="space-y-2">
          {audit.map((a) => (
            <div key={a.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[12px] font-medium text-[#6B7280]">
                {new Date(a.at).toLocaleString()} · {a.actor} · {a.action}
              </p>
              <p className="mt-1 text-[14px] text-[#334155]">{a.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
