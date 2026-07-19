import {
  applicationStore,
  candidateStore,
  certificationStore,
  companyStore,
  getAnalytics,
  interviewStore,
  jobStore,
  listByTenant,
  onboardingStore,
  workforceDocumentStore,
} from "@/lib/data/workforce-store";
import type {
  ApplicationStatus,
  EquipmentType,
  ProfessionalRole,
} from "@/lib/types/workforce";
import {
  APPLICATION_STATUSES,
  EQUIPMENT_TYPE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
} from "@/lib/types/workforce";

export type WorkforceKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: "info" | "success" | "warning" | "critical";
};

export function getWorkforceDashboard(tenantId?: string) {
  const jobs = listByTenant(jobStore, tenantId).filter((j) => j.status === "open");
  const applications = listByTenant(applicationStore, tenantId);
  const interviews = listByTenant(interviewStore, tenantId);
  const onboarding = listByTenant(onboardingStore, tenantId);
  const candidates = listByTenant(candidateStore, tenantId);
  const certs = listByTenant(certificationStore, tenantId);
  const docs = listByTenant(workforceDocumentStore, tenantId);

  const now = new Date("2026-07-17T12:00:00.000Z");
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const interviewsThisWeek = interviews.filter((i) => {
    const at = new Date(i.scheduledAt);
    return i.status === "scheduled" && at >= now && at <= weekEnd;
  });

  const pipeline = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  const topMatches = [...candidates]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  const urgentExpirations = [
    ...certs
      .filter((c) => c.status === "expiring" || c.status === "expired")
      .map((c) => ({
        id: c.id,
        label: c.name,
        detail: `Expires ${c.expiresAt ?? "soon"}`,
        href: "/workforce/certifications",
        tone: c.status === "expired" ? ("critical" as const) : ("warning" as const),
      })),
    ...docs
      .filter((d) => d.expiresAt)
      .filter((d) => {
        const exp = new Date(d.expiresAt!);
        const days = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return days <= 60;
      })
      .map((d) => ({
        id: d.id,
        label: d.name,
        detail: `Expires ${d.expiresAt}`,
        href: "/workforce/documents",
        tone: "warning" as const,
      })),
  ].slice(0, 6);

  const kpis: WorkforceKpi[] = [
    {
      id: "open-jobs",
      label: "Open jobs",
      value: String(jobs.length),
      hint: "Actively hiring",
      tone: "info",
    },
    {
      id: "applications",
      label: "Active applications",
      value: String(
        applications.filter((a) => !["hired", "rejected"].includes(a.status)).length,
      ),
      hint: "In pipeline",
      tone: "info",
    },
    {
      id: "interviews",
      label: "Interviews this week",
      value: String(interviewsThisWeek.length),
      hint: "Scheduled",
      tone: interviewsThisWeek.length ? "success" : "info",
    },
    {
      id: "onboarding",
      label: "Onboarding",
      value: String(onboarding.filter((o) => o.status === "in_progress").length),
      hint: "In progress",
      tone: "warning",
    },
    {
      id: "urgent",
      label: "Urgent expirations",
      value: String(urgentExpirations.length),
      hint: "Docs & certs",
      tone: urgentExpirations.length ? "critical" : "success",
    },
  ];

  return {
    kpis,
    jobs,
    pipeline,
    interviewsThisWeek,
    onboarding: onboarding.filter((o) => o.status !== "complete"),
    topMatches,
    urgentExpirations,
    companies: listByTenant(companyStore, tenantId),
    analytics: getAnalytics(),
  };
}

export type JobFilters = {
  role?: ProfessionalRole | "all";
  equipment?: EquipmentType | "all";
  region?: string;
  query?: string;
};

export function filterJobs(filters: JobFilters = {}, tenantId?: string) {
  let jobs = listByTenant(jobStore, tenantId).filter((j) => j.status !== "closed");
  if (filters.role && filters.role !== "all") {
    jobs = jobs.filter((j) => j.role === filters.role);
  }
  if (filters.equipment && filters.equipment !== "all") {
    jobs = jobs.filter((j) => j.equipment.includes(filters.equipment as EquipmentType));
  }
  if (filters.region && filters.region !== "all") {
    jobs = jobs.filter((j) =>
      j.region.toLowerCase().includes(filters.region!.toLowerCase()),
    );
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        PROFESSIONAL_ROLE_LABELS[j.role].toLowerCase().includes(q),
    );
  }
  return jobs;
}

export function formatPay(job: {
  payMin?: number;
  payMax?: number;
  payUnit: "salary" | "hourly" | "cpm" | "percent";
}) {
  const { payMin, payMax, payUnit } = job;
  if (payMin == null && payMax == null) return "Pay negotiable";
  const fmt = (n: number) => {
    if (payUnit === "cpm") return `$${n.toFixed(2)}/mi`;
    if (payUnit === "hourly") return `$${n}/hr`;
    if (payUnit === "percent") return `${n}%`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  };
  if (payMin != null && payMax != null) return `${fmt(payMin)} – ${fmt(payMax)}`;
  if (payMin != null) return `From ${fmt(payMin)}`;
  return `Up to ${fmt(payMax!)}`;
}

export function equipmentLabel(eq: EquipmentType[]) {
  if (!eq.length) return "Any";
  return eq.map((e) => EQUIPMENT_TYPE_LABELS[e]).join(", ");
}

export function statusTone(
  status: ApplicationStatus | string,
): "info" | "success" | "warning" | "critical" | "disabled" {
  switch (status) {
    case "hired":
    case "clear":
    case "completed":
    case "valid":
    case "open":
      return "success";
    case "offer":
    case "interview":
    case "in_progress":
    case "scheduled":
    case "expiring":
    case "pending":
    case "pending_review":
      return "warning";
    case "rejected":
    case "failed":
    case "expired":
    case "canceled":
    case "no_show":
      return "critical";
    case "applied":
    case "screening":
      return "info";
    default:
      return "disabled";
  }
}

export function candidateFullName(c: { firstName: string; lastName: string }) {
  return `${c.firstName} ${c.lastName}`;
}
