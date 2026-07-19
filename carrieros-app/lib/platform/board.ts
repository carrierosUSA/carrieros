import { getActiveTenantId } from "@/lib/data/tenant";
import { buildExecutiveBoard, type ExecutiveKpi } from "@/lib/executive/executive-board";
import { CORE_PLATFORM_MODULES, ECOSYSTEM_NODES } from "@/lib/platform/catalog";
import {
  listAutomationRecipes,
  listInstalledApps,
  listPartners,
  listPlatformApps,
} from "@/lib/platform/store";
import type { BusinessHealthScore } from "@/lib/platform/types";
import { getWorkforceDashboard } from "@/lib/workforce/board";

function fallbackKpi(
  id: string,
  label: string,
  value: string,
  detail: string,
  href: string,
): ExecutiveKpi {
  return {
    id,
    label,
    value,
    detail,
    href,
    tone: "info",
  };
}

export async function getBusinessHealthScore(
  tenantId = getActiveTenantId(),
): Promise<BusinessHealthScore> {
  const board = await buildExecutiveBoard(tenantId);
  const financeWeight = Math.min(100, Math.max(40, board.scores.onTimePercent));
  const fleetWeight = board.scores.fleetHealth;
  const safetyWeight = board.scores.safetyScore;
  const utilWeight = Math.round(
    (board.scores.fleetUtilization + board.scores.driverUtilization) / 2,
  );

  const score = Math.round(
    financeWeight * 0.25 + fleetWeight * 0.3 + safetyWeight * 0.25 + utilWeight * 0.2,
  );

  let label = "Needs attention";
  if (score >= 85) label = "Strong";
  else if (score >= 70) label = "Healthy";
  else if (score >= 55) label = "Watch closely";

  return {
    score,
    label,
    drivers: [
      { label: "On-time", value: board.scores.onTimePercent, href: "/loads" },
      { label: "Fleet health", value: board.scores.fleetHealth, href: "/fleet" },
      { label: "Safety", value: board.scores.safetyScore, href: "/compliance" },
      { label: "Utilization", value: utilWeight, href: "/dashboard" },
    ],
  };
}

export async function getPlatformHomeSnapshot(tenantId = getActiveTenantId()) {
  const health = await getBusinessHealthScore(tenantId);
  const board = await buildExecutiveBoard(tenantId);
  const installed = listInstalledApps();
  const recipes = listAutomationRecipes().filter((r) => r.enabled);
  const partners = listPartners();
  const liveCore = CORE_PLATFORM_MODULES.filter((m) => m.status === "live").length;
  const comingCore = CORE_PLATFORM_MODULES.filter((m) => m.status === "coming").length;

  return {
    health,
    companyName: board.companyName,
    counts: board.counts,
    installedApps: installed.length,
    catalogApps: listPlatformApps().length,
    enabledRecipes: recipes.length,
    partnersLive: partners.filter(
      (p) => p.integrationStatus === "live" || p.integrationStatus === "certified",
    ).length,
    liveCore,
    comingCore,
    voiceCommandsHref: "/platform#voice-os",
  };
}

export async function getCommandCenterSnapshot(tenantId = getActiveTenantId()) {
  const board = await buildExecutiveBoard(tenantId);
  const health = await getBusinessHealthScore(tenantId);
  const workforce = getWorkforceDashboard(tenantId);
  const openJobs = workforce.jobs.length;
  const pipelineActive = workforce.pipeline.reduce((sum, p) => sum + p.count, 0);

  const industryAlerts = [
    {
      id: "ia-1",
      tone: "warning" as const,
      title: "Regional fuel pressure",
      detail: "Midwest diesel averages are elevated — review IFTA and fuel cards.",
      href: "/ifta",
    },
    {
      id: "ia-2",
      tone: "info" as const,
      title: "Hiring market",
      detail: `${openJobs} open roles · ${pipelineActive} applications in pipeline.`,
      href: "/workforce",
    },
    {
      id: "ia-3",
      tone: "critical" as const,
      title: "Compliance attention",
      detail: "Review expiring insurance and medical items before they block dispatch.",
      href: "/compliance",
    },
  ];

  const flatKpis = board.sections.flatMap((section) => section.kpis);
  const pick = (id: string) => flatKpis.find((k) => k.id === id);

  return {
    companyName: board.companyName,
    generatedAtLabel: board.generatedAtLabel,
    health,
    scores: board.scores,
    counts: board.counts,
    kpis: {
      liveFleet:
        pick("trucks-available") ??
        fallbackKpi(
          "trucks-available",
          "Live fleet",
          String(board.counts.trucksAvailable),
          "Trucks available",
          "/fleet",
        ),
      revenue:
        pick("revenue-month") ??
        pick("revenue-today") ??
        fallbackKpi("revenue", "Revenue", "—", "Open finance", "/finance"),
      profit:
        pick("profit") ??
        fallbackKpi("profit", "Profit", "—", "Open finance", "/finance"),
      cashFlow:
        pick("cash-flow") ??
        pick("outstanding") ??
        fallbackKpi("cash-flow", "Cash flow", "—", "Open finance", "/finance"),
      compliance:
        pick("compliance-insurance") ??
        fallbackKpi("compliance", "Compliance", "Open", "Review items", "/compliance"),
      hiring: fallbackKpi(
        "hiring",
        "Hiring",
        String(openJobs),
        `${pipelineActive} in pipeline`,
        "/workforce",
      ),
      safety:
        pick("compliance-cdl") ??
        fallbackKpi(
          "safety",
          "Safety",
          String(board.scores.safetyScore),
          "Safety score",
          "/compliance",
        ),
      fuel:
        pick("fuel-summary") ??
        pick("cost-per-mile") ??
        fallbackKpi("fuel", "Fuel / IFTA", "Open", "Mileage & fuel", "/ifta"),
      maintenance:
        pick("maintenance-due") ??
        fallbackKpi(
          "maintenance",
          "Maintenance",
          String(board.scores.fleetHealth),
          "Fleet health",
          "/fleet/maintenance",
        ),
      loads:
        pick("loads-today") ??
        fallbackKpi(
          "loads",
          "Loads today",
          String(board.counts.loadsToday),
          "Dispatch board",
          "/loads",
        ),
    },
    aiInsights: flatKpis
      .filter((k) => k.insight)
      .slice(0, 4)
      .map((k) => ({
        id: k.id,
        title: k.label,
        detail: k.insight!,
        href: k.href,
      })),
    industryAlerts,
    dashboardHref: "/dashboard",
  };
}

export function getEcosystemMap() {
  return {
    nodes: ECOSYSTEM_NODES,
    coreLive: CORE_PLATFORM_MODULES.filter((m) => m.status === "live"),
    coreComing: CORE_PLATFORM_MODULES.filter((m) => m.status === "coming"),
  };
}
