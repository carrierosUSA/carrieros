"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CompanyAlphAlertsStrip from "@/components/companies/CompanyAlphAlertsStrip";
import CompanyDetailTabs, {
  type CompanyDetailTab,
} from "@/components/companies/CompanyDetailTabs";
import CompanyQuickActions from "@/components/companies/CompanyQuickActions";
import CompanyStatusBadge from "@/components/companies/CompanyStatusBadge";
import CompanyTabPanels from "@/components/companies/CompanyTabPanels";
import CompanyTypeBadge from "@/components/companies/CompanyTypeBadge";
import FadeIn from "@/components/ui/FadeIn";
import type { CompanyAlphAlert } from "@/lib/companies/company-alph-alerts";
import {
  formatCompanyMoney,
  formatPerformanceScore,
  getCompanyInitials,
  readFavoriteCompanyIds,
  toggleFavoriteCompanyId,
  trackRecentCompanyId,
} from "@/lib/companies/company-board";
import { formatCompanyCityState } from "@/lib/data/companies";
import type { DirectoryCompany, Load } from "@/lib/types";

type CompanyDetailShellProps = {
  company: DirectoryCompany;
  loads: Load[];
  activeTab: CompanyDetailTab;
  alphAlerts: CompanyAlphAlert[];
};

export default function CompanyDetailShell({
  company,
  loads,
  activeTab,
  alphAlerts,
}: CompanyDetailShellProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    trackRecentCompanyId(company.id);
    setIsFavorite(readFavoriteCompanyIds().includes(company.id));
  }, [company.id]);

  return (
    <FadeIn className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/companies"
          className="text-[14px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          ← All companies
        </Link>
      </div>

      <header className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#EFF6FF] text-[18px] font-bold text-[#2563EB]">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                getCompanyInitials(company.name)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-bold tracking-tight text-slate-950">
                  {company.name}
                </h1>
                <CompanyStatusBadge status={company.status} />
                <CompanyTypeBadge type={company.type} />
                <button
                  type="button"
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                  title={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                  onClick={() => {
                    const next = toggleFavoriteCompanyId(company.id);
                    setIsFavorite(next.includes(company.id));
                  }}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[15px] ring-1 ring-[#EAEAEA] transition ${
                    isFavorite
                      ? "bg-[#FFF7ED] text-[#EA580C]"
                      : "bg-[#F8FAFC] text-slate-400 hover:text-[#EA580C]"
                  }`}
                >
                  {isFavorite ? "★" : "☆"}
                </button>
              </div>
              <p className="mt-1 text-[14px] text-slate-500">
                {[
                  company.mcNumber,
                  company.dotNumber,
                  company.scac,
                  formatCompanyCityState(company.address),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-600">
                <span>
                  Score{" "}
                  <strong className="text-slate-900">
                    {formatPerformanceScore(company.performanceScore)}
                  </strong>
                </span>
                {company.outstandingBalance != null ? (
                  <span>
                    Outstanding{" "}
                    <strong className="text-slate-900">
                      {formatCompanyMoney(company.outstandingBalance)}
                    </strong>
                  </span>
                ) : null}
                {company.averageLoadValue != null ? (
                  <span>
                    Avg load{" "}
                    <strong className="text-slate-900">
                      {formatCompanyMoney(company.averageLoadValue)}
                    </strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <CompanyQuickActions company={company} />
        </div>
      </header>

      <CompanyAlphAlertsStrip alerts={alphAlerts} company={company} />

      <CompanyDetailTabs activeTab={activeTab} />

      <CompanyTabPanels
        company={company}
        loads={loads}
        activeTab={activeTab}
      />
    </FadeIn>
  );
}
