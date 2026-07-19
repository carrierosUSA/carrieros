"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CompanyAlphAlertsStrip from "@/components/companies/CompanyAlphAlertsStrip";
import CompanyCard from "@/components/companies/CompanyCard";
import CompanyDashboardStats from "@/components/companies/CompanyDashboardStats";
import CompanySearchBar from "@/components/companies/CompanySearchBar";
import FadeIn from "@/components/ui/FadeIn";
import type { CompanyAlphAlert } from "@/lib/companies/company-alph-alerts";
import {
  buildCompanyDashboardStats,
  filterCompaniesByQuery,
  readFavoriteCompanyIds,
  readRecentCompanyIds,
  sortCompaniesForDashboard,
  toggleFavoriteCompanyId,
} from "@/lib/companies/company-board";
import type { DirectoryCompany } from "@/lib/types";

type CompanyDashboardClientProps = {
  companies: DirectoryCompany[];
  alphInsights: CompanyAlphAlert[];
};

export default function CompanyDashboardClient({
  companies,
  alphInsights,
}: CompanyDashboardClientProps) {
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(readFavoriteCompanyIds());
    setRecentIds(readRecentCompanyIds());
  }, []);

  const stats = useMemo(
    () => buildCompanyDashboardStats(companies, favoriteIds, recentIds),
    [companies, favoriteIds, recentIds],
  );

  const filtered = useMemo(() => {
    const matched = filterCompaniesByQuery(companies, query);
    return sortCompaniesForDashboard(matched, favoriteIds, recentIds);
  }, [companies, query, favoriteIds, recentIds]);

  function handleToggleFavorite(id: string) {
    setFavoriteIds(toggleFavoriteCompanyId(id));
  }

  return (
    <FadeIn className="space-y-6">
      <CompanyDashboardStats stats={stats} />

      {alphInsights.length > 0 ? (
        <CompanyAlphAlertsStrip
          alerts={alphInsights}
          title="Alph company insights"
          subtitle="Frequently used partners and payment signals across your directory."
        />
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-slate-900">
            All companies
          </p>
          <Link
            href="/loads/new"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            + Create Load
          </Link>
        </div>
        <CompanySearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
          <p className="text-[15px] font-semibold text-slate-900">
            No companies found
          </p>
          <p className="mt-1 text-[14px] text-slate-500">
            Try a different search or add a new company to the directory.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isFavorite={favoriteIds.includes(company.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
