import type { DirectoryCompany } from "@/lib/types/company";
import { formatCompanyMoney } from "@/lib/companies/company-board";

export type CompanyAlphAlertSeverity = "info" | "warning" | "critical";

export type CompanyAlphFixAction =
  | "viewPayments"
  | "viewOverview"
  | "viewDocuments"
  | "viewContacts"
  | "viewLoads"
  | "createLoad"
  | "callAccounting";

export type CompanyAlphAlert = {
  id: string;
  severity: CompanyAlphAlertSeverity;
  message: string;
  fixLabel: string;
  fixAction: CompanyAlphFixAction;
};

export function detectCompanyAlphAlerts(
  company: DirectoryCompany,
): CompanyAlphAlert[] {
  const results: CompanyAlphAlert[] = [];

  if (company.frequentlyUsed && company.status === "active") {
    results.push({
      id: `${company.id}-frequent`,
      severity: "info",
      message: "Frequently used — Alph suggests this company for your next task",
      fixLabel: "Create Load",
      fixAction: "createLoad",
    });
  }

  if (company.paymentRisk === "high") {
    results.push({
      id: `${company.id}-payment-risk`,
      severity: "critical",
      message: `High payment risk${
        company.outstandingBalance
          ? ` — ${formatCompanyMoney(company.outstandingBalance)} outstanding`
          : ""
      }`,
      fixLabel: "View Payments",
      fixAction: "viewPayments",
    });
  } else if (company.paymentRisk === "medium") {
    results.push({
      id: `${company.id}-payment-risk`,
      severity: "warning",
      message: "Medium payment risk — confirm terms before booking",
      fixLabel: "View Payments",
      fixAction: "viewPayments",
    });
  }

  if ((company.claimsCount ?? 0) > 0) {
    results.push({
      id: `${company.id}-claims`,
      severity: (company.claimsCount ?? 0) >= 2 ? "critical" : "warning",
      message: `Claims history — ${company.claimsCount} claim${
        (company.claimsCount ?? 0) === 1 ? "" : "s"
      } on file`,
      fixLabel: "View Contacts",
      fixAction: "viewContacts",
    });
  }

  if ((company.averageDetentionHours ?? 0) >= 3) {
    results.push({
      id: `${company.id}-detention`,
      severity: "warning",
      message: `Average detention ${company.averageDetentionHours?.toFixed(1)} hrs — plan extra dwell time`,
      fixLabel: "View Overview",
      fixAction: "viewOverview",
    });
  }

  if (typeof company.averageLoadValue === "number") {
    results.push({
      id: `${company.id}-avg-value`,
      severity: "info",
      message: `Average load value ${formatCompanyMoney(company.averageLoadValue)}`,
      fixLabel: "View Loads",
      fixAction: "viewLoads",
    });
  }

  if (company.preferredLanes && company.preferredLanes.length > 0) {
    results.push({
      id: `${company.id}-lanes`,
      severity: "info",
      message: `Preferred lanes: ${company.preferredLanes.slice(0, 2).join(", ")}`,
      fixLabel: "View Overview",
      fixAction: "viewOverview",
    });
  }

  if (typeof company.performanceScore === "number") {
    const tone: CompanyAlphAlertSeverity =
      company.performanceScore >= 90
        ? "info"
        : company.performanceScore < 75
          ? "warning"
          : "info";

    results.push({
      id: `${company.id}-score`,
      severity: tone,
      message: `Performance score: ${Math.round(company.performanceScore)}%`,
      fixLabel: "View Overview",
      fixAction: "viewOverview",
    });
  }

  const expiredDocs = company.documents.filter((doc) => doc.status === "expired");
  if (expiredDocs.length > 0) {
    results.push({
      id: `${company.id}-docs`,
      severity: "warning",
      message: `${expiredDocs.length} expired document${expiredDocs.length === 1 ? "" : "s"} need renewal`,
      fixLabel: "View Documents",
      fixAction: "viewDocuments",
    });
  }

  if (company.status === "inactive") {
    results.push({
      id: `${company.id}-inactive`,
      severity: "warning",
      message: "Company is inactive — confirm before using on new loads",
      fixLabel: "View Overview",
      fixAction: "viewOverview",
    });
  }

  const severityOrder: Record<CompanyAlphAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return results
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);
}

export function detectDashboardCompanyAlphInsights(
  companies: DirectoryCompany[],
): CompanyAlphAlert[] {
  const insights: CompanyAlphAlert[] = [];
  const frequent = companies.filter(
    (company) => company.frequentlyUsed && company.status === "active",
  );
  const highRisk = companies.filter(
    (company) => company.paymentRisk === "high" && company.status === "active",
  );

  if (frequent.length > 0) {
    insights.push({
      id: "dashboard-frequent",
      severity: "info",
      message: `Frequently used: ${frequent
        .slice(0, 3)
        .map((company) => company.name)
        .join(", ")}`,
      fixLabel: "Create Load",
      fixAction: "createLoad",
    });
  }

  if (highRisk.length > 0) {
    insights.push({
      id: "dashboard-risk",
      severity: "critical",
      message: `${highRisk.length} compan${highRisk.length === 1 ? "y needs" : "ies need"} payment attention`,
      fixLabel: "View Payments",
      fixAction: "viewPayments",
    });
  }

  return insights.slice(0, 3);
}
