"use client";

import { useRouter } from "next/navigation";
import type { CompanyAlphAlert } from "@/lib/companies/company-alph-alerts";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  buildMailtoUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import { getCompanyContact } from "@/lib/data/companies";
import type { DirectoryCompany } from "@/lib/types";

type CompanyAlphAlertsStripProps = {
  alerts: CompanyAlphAlert[];
  company?: DirectoryCompany;
  title?: string;
  subtitle?: string;
};

function severityStyles(severity: CompanyAlphAlert["severity"]) {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "warning":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.info;
  }
}

export default function CompanyAlphAlertsStrip({
  alerts,
  company,
  title,
  subtitle,
}: CompanyAlphAlertsStripProps) {
  const router = useRouter();

  if (alerts.length === 0) {
    return null;
  }

  function handleFix(alert: CompanyAlphAlert) {
    switch (alert.fixAction) {
      case "createLoad":
        router.push("/loads/new");
        break;
      case "viewPayments":
        if (company) {
          router.push(`/companies/${company.id}?tab=payments`);
        }
        break;
      case "viewDocuments":
        if (company) {
          router.push(`/companies/${company.id}?tab=documents`);
        }
        break;
      case "viewContacts":
        if (company) {
          router.push(`/companies/${company.id}?tab=contacts`);
        }
        break;
      case "viewLoads":
        if (company) {
          router.push(`/companies/${company.id}?tab=loads`);
        }
        break;
      case "viewOverview":
        if (company) {
          router.push(`/companies/${company.id}?tab=overview`);
        }
        break;
      case "callAccounting": {
        if (!company) {
          break;
        }
        const accounting = getCompanyContact(company, "accounting");
        const phone = accounting?.phone ?? company.phone ?? "";
        const tel = buildTelUrl(phone);
        if (tel) {
          openCommunicationUrl(tel);
        } else if (accounting?.email) {
          const mail = buildMailtoUrl(
            accounting.email,
            `Payment follow-up — ${company.name}`,
            `Hi ${accounting.name.split(" ")[0]},\n\n`,
          );
          if (mail) {
            openCommunicationUrl(mail);
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return (
    <section
      aria-label="Alph company alerts"
      className={`rounded-[14px] p-4 ring-1 ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          ✦
        </span>
        <div>
          <p className={`text-[14px] font-bold ${CARRIEROS_COLORS.warning.text}`}>
            {title ??
              `Alph found ${alerts.length} insight${alerts.length === 1 ? "" : "s"}`}
          </p>
          <p className="text-[13px] font-medium text-slate-600">
            {subtitle ?? "Smart signals across your company directory."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert) => {
          const tone = severityStyles(alert.severity);

          return (
            <div
              key={alert.id}
              className="flex flex-wrap items-center gap-3 rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
            >
              <span
                className={`inline-flex h-2 w-2 shrink-0 rounded-full ${tone.bg}`}
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-[14px] font-semibold text-slate-900">
                {alert.message}
              </p>
              <button
                type="button"
                onClick={() => handleFix(alert)}
                className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                {alert.fixLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
