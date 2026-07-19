import type { Load } from "@/lib/types";
import type {
  CompanyStatus,
  DirectoryCompany,
} from "@/lib/types/company";
import {
  formatCompanyCityState,
  getCompanyContact,
} from "@/lib/data/companies";
import { COMPANY_TYPE_LABELS } from "@/lib/types/company";

export type CompanyDashboardStats = {
  totalCompanies: number;
  active: number;
  inactive: number;
  favorites: number;
  recentlyUsed: number;
};

const FAVORITES_KEY = "carrieros.company.favorites";
const RECENT_KEY = "carrieros.company.recent";
const MAX_RECENT = 12;

export function buildCompanyDashboardStats(
  companies: DirectoryCompany[],
  favoriteIds: string[] = [],
  recentIds: string[] = [],
): CompanyDashboardStats {
  let active = 0;
  let inactive = 0;

  for (const company of companies) {
    if (company.status === "active") {
      active += 1;
    } else {
      inactive += 1;
    }
  }

  const companyIds = new Set(companies.map((company) => company.id));

  return {
    totalCompanies: companies.length,
    active,
    inactive,
    favorites: favoriteIds.filter((id) => companyIds.has(id)).length,
    recentlyUsed: recentIds.filter((id) => companyIds.has(id)).length,
  };
}

export function filterCompaniesByQuery(
  companies: DirectoryCompany[],
  query: string,
): DirectoryCompany[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return companies;
  }

  return companies.filter((company) => {
    const contactNames = company.contacts.map((contact) => contact.name).join(" ");
    const city = company.address?.city ?? "";
    const state = company.address?.state ?? "";

    return [
      company.name,
      COMPANY_TYPE_LABELS[company.type],
      company.type,
      company.mcNumber ?? "",
      company.dotNumber ?? "",
      company.scac ?? "",
      company.phone ?? "",
      company.email ?? "",
      company.website ?? "",
      formatCompanyCityState(company.address),
      city,
      state,
      company.status,
      contactNames,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
}

export function filterCompaniesByStatus(
  companies: DirectoryCompany[],
  status: CompanyStatus | "all",
): DirectoryCompany[] {
  if (status === "all") {
    return companies;
  }

  return companies.filter((company) => company.status === status);
}

export function getCompanyLoads(
  company: DirectoryCompany,
  loads: Load[],
): Load[] {
  return loads.filter((load) => {
    if (company.linkedBrokerId && load.brokerId === company.linkedBrokerId) {
      return true;
    }

    if (company.linkedCustomerId && load.customerId === company.linkedCustomerId) {
      return true;
    }

    return false;
  });
}

export function formatCompanyMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompanyDate(iso?: string): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPerformanceScore(score?: number): string {
  if (typeof score !== "number") {
    return "—";
  }

  return `${Math.round(score)}%`;
}

export function formatDetentionHours(hours?: number): string {
  if (typeof hours !== "number") {
    return "—";
  }

  return `${hours.toFixed(1)} hrs`;
}

export function getCompanyInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getPrimaryCompanyContact(company: DirectoryCompany) {
  return (
    getCompanyContact(company, "dispatcher") ??
    getCompanyContact(company, "manager") ??
    getCompanyContact(company, "shipping") ??
    getCompanyContact(company, "accounting") ??
    company.contacts[0]
  );
}

export function readFavoriteCompanyIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeFavoriteCompanyIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function toggleFavoriteCompanyId(id: string): string[] {
  const current = readFavoriteCompanyIds();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  writeFavoriteCompanyIds(next);
  return next;
}

export function readRecentCompanyIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function trackRecentCompanyId(id: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const current = readRecentCompanyIds().filter((item) => item !== id);
  const next = [id, ...current].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function sortCompaniesForDashboard(
  companies: DirectoryCompany[],
  favoriteIds: string[],
  recentIds: string[],
): DirectoryCompany[] {
  const favoriteSet = new Set(favoriteIds);
  const recentIndex = new Map(recentIds.map((id, index) => [id, index]));

  return [...companies].sort((a, b) => {
    const aFav = favoriteSet.has(a.id) ? 0 : 1;
    const bFav = favoriteSet.has(b.id) ? 0 : 1;
    if (aFav !== bFav) {
      return aFav - bFav;
    }

    const aRecent = recentIndex.has(a.id) ? recentIndex.get(a.id)! : 999;
    const bRecent = recentIndex.has(b.id) ? recentIndex.get(b.id)! : 999;
    if (aRecent !== bRecent) {
      return aRecent - bRecent;
    }

    if ((b.frequentlyUsed ? 1 : 0) !== (a.frequentlyUsed ? 1 : 0)) {
      return (b.frequentlyUsed ? 1 : 0) - (a.frequentlyUsed ? 1 : 0);
    }

    return a.name.localeCompare(b.name);
  });
}
