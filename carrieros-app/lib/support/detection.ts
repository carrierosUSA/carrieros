import type {
  HealthService,
  HealthServiceStatus,
  SupportIssue,
} from "@/lib/support/types";

export function buildSupportHealth(): HealthService[] {
  const now = "2026-07-17T16:40:00Z";
  return [
    { id: "app", name: "Application", status: "operational", latencyMs: 42, lastCheckedAt: now },
    { id: "db", name: "Database", status: "operational", latencyMs: 18, lastCheckedAt: now },
    { id: "auth", name: "Authentication", status: "operational", latencyMs: 31, lastCheckedAt: now },
    { id: "storage", name: "File storage", status: "operational", latencyMs: 55, lastCheckedAt: now },
    { id: "email", name: "Email", status: "degraded", latencyMs: 820, lastCheckedAt: now, detail: "Elevated bounce rate on one SMTP lane" },
    { id: "sms", name: "SMS", status: "operational", latencyMs: 210, lastCheckedAt: now },
    { id: "payments", name: "Payments", status: "operational", latencyMs: 120, lastCheckedAt: now },
    { id: "maps", name: "Maps", status: "operational", latencyMs: 95, lastCheckedAt: now },
    { id: "eld", name: "ELD integrations", status: "degraded", latencyMs: 640, lastCheckedAt: now, detail: "Token refresh intermittent on one provider" },
    { id: "accounting", name: "Accounting integrations", status: "operational", latencyMs: 180, lastCheckedAt: now },
    { id: "notifications", name: "Notifications", status: "operational", latencyMs: 40, lastCheckedAt: now },
    { id: "jobs", name: "Background jobs", status: "operational", latencyMs: 22, lastCheckedAt: now },
    { id: "ai", name: "AI services", status: "operational", latencyMs: 310, lastCheckedAt: now },
    { id: "api", name: "API response time", status: "operational", latencyMs: 68, lastCheckedAt: now },
  ];
}

export function healthStatusLabel(status: HealthServiceStatus): string {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "partial_outage":
      return "Partial Outage";
    case "major_outage":
      return "Major Outage";
    case "maintenance":
      return "Maintenance";
  }
}

export function overallHealth(services: HealthService[]): HealthServiceStatus {
  if (services.some((s) => s.status === "major_outage")) return "major_outage";
  if (services.some((s) => s.status === "partial_outage")) return "partial_outage";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  return "operational";
}

export function detectSeedIssues(tenantId: string): SupportIssue[] {
  const base = "2026-07-17";
  return [
    {
      id: "issue-eld-token",
      ticketNumber: "COS-10482",
      tenantId,
      title: "ELD connection stopped syncing",
      summary: "Samsara access token expired; GPS and mileage stalled.",
      humanMessage:
        "Your ELD connection stopped syncing at 10:42 AM. Alph is checking the connection now.",
      category: "integration",
      severity: "high",
      status: "diagnosing",
      queue: "integrations",
      detectedAt: `${base}T10:42:00Z`,
      updatedAt: `${base}T10:48:00Z`,
      page: "/integrations",
      device: "Desktop",
      browser: "Chrome 128",
      errorMessage: "oauth_token_expired",
      integration: "Samsara",
      dataAffected: "Live GPS, HOS, state mileage",
      alphDiagnosis: "The ELD access token expired and needs a safe reconnect.",
      repairAttempts: [],
      workaround: "Use CSV mileage upload under ELD fallbacks until reconnect completes.",
      autoResolvable: true,
      risky: false,
      carrierVisible: true,
      estimatedUpdate: "Usually under 15 minutes",
      timeline: [
        {
          id: "t1",
          at: `${base}T10:42:00Z`,
          kind: "detected",
          message: "ELD sync heartbeat missed.",
          actor: "system",
          visibleToCarrier: true,
        },
        {
          id: "t2",
          at: `${base}T10:45:00Z`,
          kind: "diagnosing",
          message: "Alph diagnosed an expired access token.",
          actor: "alph",
          visibleToCarrier: true,
        },
      ],
    },
    {
      id: "issue-pod-missing",
      ticketNumber: "COS-10491",
      tenantId,
      title: "Missing POD blocks invoicing",
      summary: "LD-24013 cannot be invoiced without POD.",
      humanMessage:
        "Load LD-24013 is missing a proof of delivery. Accounting cannot invoice yet.",
      category: "documents",
      severity: "high",
      status: "waiting_for_user",
      queue: "accounting",
      detectedAt: `${base}T09:10:00Z`,
      updatedAt: `${base}T09:12:00Z`,
      page: "/documents/health",
      alphDiagnosis: "Required POD document is missing for a delivered load.",
      repairAttempts: [
        {
          id: "r1",
          at: `${base}T09:11:00Z`,
          action: "Guide missing fields",
          safe: true,
          result: "success",
          detail: "Opened Document Health and prompted Request From Driver.",
        },
      ],
      workaround: "Request POD from the driver or upload from Documents.",
      autoResolvable: false,
      risky: false,
      carrierVisible: true,
      timeline: [
        {
          id: "p1",
          at: `${base}T09:10:00Z`,
          kind: "detected",
          message: "Document Health score critical for LD-24013.",
          actor: "alph",
          visibleToCarrier: true,
        },
      ],
    },
    {
      id: "issue-email-lane",
      ticketNumber: "COS-10455",
      tenantId,
      title: "Invoice email failed to send",
      summary: "SMTP lane degraded; invoice email to broker bounced.",
      humanMessage:
        "Transpo.ai could not send an invoice email. Alph can retry delivery safely.",
      category: "system",
      severity: "medium",
      status: "auto_repairing",
      queue: "technical",
      detectedAt: `${base}T08:05:00Z`,
      updatedAt: `${base}T08:06:00Z`,
      page: "/finance?tab=invoices",
      errorMessage: "smtp_451_tempfail",
      alphDiagnosis: "Temporary email provider failure on one outbound lane.",
      repairAttempts: [],
      autoResolvable: true,
      risky: false,
      carrierVisible: true,
      timeline: [
        {
          id: "e1",
          at: `${base}T08:05:00Z`,
          kind: "detected",
          message: "Email send failed for invoice INV-8841.",
          actor: "system",
          visibleToCarrier: true,
        },
      ],
    },
    {
      id: "issue-setup-bank",
      ticketNumber: "COS-10302",
      tenantId,
      title: "Critical setup incomplete",
      summary: "Bank details missing from company startup.",
      humanMessage:
        "Company setup is incomplete. Bank details are still missing — Alph can guide you.",
      category: "ux",
      severity: "medium",
      status: "waiting_for_user",
      queue: "user_training",
      detectedAt: `${base}T07:00:00Z`,
      updatedAt: `${base}T07:00:00Z`,
      page: "/setup",
      alphDiagnosis: "Critical onboarding step incomplete: bank details.",
      repairAttempts: [],
      autoResolvable: true,
      risky: false,
      carrierVisible: true,
      timeline: [
        {
          id: "s1",
          at: `${base}T07:00:00Z`,
          kind: "detected",
          message: "Setup progress alert: bank details missing.",
          actor: "alph",
          visibleToCarrier: true,
        },
      ],
    },
    {
      id: "issue-resolved-demo",
      ticketNumber: "COS-10388",
      tenantId,
      title: "Dashboard totals were stale",
      summary: "Executive KPIs refreshed after cache clear.",
      humanMessage: "Your dashboard totals were out of date. Alph refreshed them.",
      category: "system",
      severity: "low",
      status: "resolved",
      queue: "technical",
      detectedAt: `${base}T06:20:00Z`,
      updatedAt: `${base}T06:22:00Z`,
      resolvedAt: `${base}T06:22:00Z`,
      alphDiagnosis: "Stale cache on executive KPI aggregation.",
      repairAttempts: [
        {
          id: "r-cache",
          at: `${base}T06:21:00Z`,
          action: "Clear failed cache",
          safe: true,
          result: "success",
          detail: "Tenant cache cleared and KPIs recalculated.",
        },
        {
          id: "r-dash",
          at: `${base}T06:22:00Z`,
          action: "Recalculate dashboard",
          safe: true,
          result: "success",
          detail: "Dashboard totals rebuilt from ledgers.",
        },
      ],
      autoResolvable: true,
      risky: false,
      carrierVisible: true,
      rootCause: "Stale KPI cache after overnight finance import",
      resolutionSummary: "Cleared cache and recalculated dashboard totals.",
      changesMade: "Cache invalidation + KPI rebuild",
      testingCompleted: "Verified Command KPIs match finance board",
      prevention: "Shorter cache TTL after finance imports",
      followUpChecks: [
        { at: `${base}T07:22:00Z`, result: "ok" },
      ],
      timeline: [
        {
          id: "d1",
          at: `${base}T06:20:00Z`,
          kind: "detected",
          message: "KPI drift detected vs finance ledger.",
          actor: "alph",
          visibleToCarrier: true,
        },
        {
          id: "d2",
          at: `${base}T06:22:00Z`,
          kind: "resolved",
          message: "Resolved by Alph automatically.",
          actor: "alph",
          visibleToCarrier: true,
        },
      ],
    },
  ];
}
