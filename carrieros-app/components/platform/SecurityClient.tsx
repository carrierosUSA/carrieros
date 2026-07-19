import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { FraudFlag, PlatformAuditEntry } from "@/lib/platform/types";
import type { AuditEntry } from "@/lib/permissions/types";

function severityColors(severity: FraudFlag["severity"]) {
  if (severity === "critical") return TRANSPO_COLORS.critical;
  if (severity === "warning") return TRANSPO_COLORS.warning;
  return TRANSPO_COLORS.info;
}

export default function SecurityClient({
  platformAudit,
  permissionAudit,
  fraudFlags,
}: {
  platformAudit: PlatformAuditEntry[];
  permissionAudit: AuditEntry[];
  fraudFlags: FraudFlag[];
}) {
  const mergedAudit = [
    ...platformAudit.map((e) => ({
      id: e.id,
      at: e.at,
      actor: e.actor,
      summary: `${e.action} · ${e.details}`,
      source: "Platform",
    })),
    ...permissionAudit.slice(0, 12).map((e) => ({
      id: e.id,
      at: e.timestamp,
      actor: e.actorName,
      summary: `${e.action} · ${e.details}`,
      source: "Permissions",
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#EFF6FF] px-4 py-4">
        <p className="text-[14px] font-semibold text-[#1E40AF]">
          Governed by Trust & Safety Charter
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#1D4ED8]/90">
          Security, least privilege, and auditability follow the Charter and
          Constitution — not optional polish.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/platform/foundation"
            className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2563EB]"
          >
            Foundation
          </Link>
          <Link
            href="/platform/trust-charter"
            className="rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-[#334155]"
          >
            Trust & Safety Charter
          </Link>
          <Link
            href="/platform/constitution"
            className="rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-[#334155]"
          >
            Constitution
          </Link>
          <Link
            href="/platform/ai-policy"
            className="rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-[#334155]"
          >
            AI Safety Policy
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "SSO",
            detail: "Configure single sign-on in Settings when your IdP is connected.",
            href: "/settings",
            cta: "Open Settings",
          },
          {
            title: "MFA",
            detail: "Multi-factor authentication is managed in company security settings.",
            href: "/settings",
            cta: "Review MFA",
          },
          {
            title: "RBAC",
            detail: "Role-based access and permission catalogs live under Permissions.",
            href: "/settings/permissions",
            cta: "Manage roles",
          },
          {
            title: "Permission management",
            detail: "Fine-grained scopes for apps and users — local audit retained.",
            href: "/settings/permissions",
            cta: "Open permissions",
          },
        ].map((card) => (
          <div key={card.title} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <h3 className="text-[15px] font-semibold text-[#111827]">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">{card.detail}</p>
            <Link href={card.href} className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]">
              {card.cta}
            </Link>
          </div>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {[
          {
            title: "Backups",
            detail:
              "Tenant data backups are scheduled by your hosting plan. This screen shows status copy only — not a live backup appliance.",
            status: "Policy documented",
            tone: TRANSPO_COLORS.info,
          },
          {
            title: "Disaster recovery",
            detail:
              "Recovery objectives are product commitments, not a simulated failover console. Contact Support for DR runbooks.",
            status: "Runbook available",
            tone: TRANSPO_COLORS.success,
          },
          {
            title: "Encryption",
            detail:
              "Data in transit uses TLS in production deployments. This demo does not expose encryption key material.",
            status: "TLS in production",
            tone: TRANSPO_COLORS.info,
          },
        ].map((card) => (
          <div key={card.title} className="rounded-[16px] bg-white p-4 shadow-[inset_0_0_0_1px_#EEF2F7]">
            <h3 className="text-[15px] font-semibold text-[#111827]">{card.title}</h3>
            <p className={`mt-2 text-[12px] font-semibold ${card.tone.text}`}>{card.status}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">{card.detail}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-[16px] font-semibold text-[#111827]">AI fraud detection flags</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Advisory signals from Alph — review before acting. Not a payments processor.
        </p>
        <ul className="mt-3 space-y-2">
          {fraudFlags.map((flag) => {
            const colors = severityColors(flag.severity);
            return (
              <li key={flag.id} className={`rounded-[12px] px-4 py-3 ${colors.bg}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className={`text-[14px] font-semibold ${colors.text}`}>{flag.title}</p>
                    <p className="mt-1 text-[13px] text-[#475569]">{flag.detail}</p>
                  </div>
                  {flag.href ? (
                    <Link href={flag.href} className="text-[13px] font-semibold text-[#2563EB]">
                      Review
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-semibold text-[#111827]">Audit log</h2>
          <Link href="/settings/permissions" className="text-[13px] font-semibold text-[#2563EB]">
            Permissions audit
          </Link>
        </div>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Local Platform and permissions events — not a remote SIEM.
        </p>
        <ul className="mt-3 space-y-2">
          {mergedAudit.map((entry) => (
            <li
              key={entry.id}
              className="rounded-[12px] bg-[#F8F9FB] px-4 py-3 text-[13px] text-[#334155]"
            >
              <span className="font-semibold">{entry.actor}</span> · {entry.summary}
              <span className="mt-1 block text-[12px] text-[#94A3B8]">
                {new Date(entry.at).toLocaleString()} · {entry.source}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
