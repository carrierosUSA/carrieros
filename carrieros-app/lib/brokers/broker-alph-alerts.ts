import type { Broker } from "@/lib/types";

export type BrokerAlphAlertSeverity = "info" | "warning" | "critical";

export type BrokerAlphFixAction =
  | "viewPayments"
  | "callAccounting"
  | "createLoad"
  | "viewDocuments"
  | "viewContacts"
  | "viewOverview";

export type BrokerAlphAlert = {
  id: string;
  severity: BrokerAlphAlertSeverity;
  message: string;
  fixLabel: string;
  fixAction: BrokerAlphFixAction;
};

export function detectBrokerAlphAlerts(broker: Broker): BrokerAlphAlert[] {
  const results: BrokerAlphAlert[] = [];

  if (broker.status === "credit_hold") {
    results.push({
      id: `${broker.id}-credit-hold`,
      severity: "critical",
      message: `Credit hold — do not book until ${formatMoney(broker.outstandingBalance)} is cleared`,
      fixLabel: "View Payments",
      fixAction: "viewPayments",
    });
  } else if (
    broker.outstandingBalance > 25000 ||
    (broker.latePaymentCount ?? 0) >= 2
  ) {
    results.push({
      id: `${broker.id}-credit-risk`,
      severity: "warning",
      message: `Credit risk — ${formatMoney(broker.outstandingBalance)} outstanding, ${broker.latePaymentCount ?? 0} late payment${(broker.latePaymentCount ?? 0) === 1 ? "" : "s"}`,
      fixLabel: "Call Accounting",
      fixAction: "callAccounting",
    });
  }

  if (
    broker.avgPaymentDays > 30 ||
    (broker.latePaymentCount ?? 0) > 0
  ) {
    results.push({
      id: `${broker.id}-late-pay`,
      severity: broker.avgPaymentDays > 45 ? "critical" : "warning",
      message: `Late payment pattern — averaging ${broker.avgPaymentDays} days to pay`,
      fixLabel: "View Payments",
      fixAction: "viewPayments",
    });
  }

  if (typeof broker.performanceScore === "number") {
    const tone =
      broker.performanceScore >= 90
        ? ("info" as const)
        : broker.performanceScore < 70
          ? ("warning" as const)
          : ("info" as const);

    results.push({
      id: `${broker.id}-score`,
      severity: tone,
      message: `Broker performance score: ${Math.round(broker.performanceScore)}%`,
      fixLabel: "View Overview",
      fixAction: "viewOverview",
    });
  }

  if ((broker.detentionIncidents ?? 0) > 0) {
    results.push({
      id: `${broker.id}-detention`,
      severity: (broker.detentionIncidents ?? 0) >= 3 ? "warning" : "info",
      message: `Detention history — ${broker.detentionIncidents} incident${(broker.detentionIncidents ?? 0) === 1 ? "" : "s"} on file`,
      fixLabel: "View Overview",
      fixAction: "viewOverview",
    });
  }

  if ((broker.claimsCount ?? 0) > 0) {
    results.push({
      id: `${broker.id}-claims`,
      severity: (broker.claimsCount ?? 0) >= 2 ? "critical" : "warning",
      message: `Claims history — ${broker.claimsCount} claim${(broker.claimsCount ?? 0) === 1 ? "" : "s"} recorded`,
      fixLabel: "View Contacts",
      fixAction: "viewContacts",
    });
  }

  if (broker.recommended && broker.status === "active") {
    results.push({
      id: `${broker.id}-recommended`,
      severity: "info",
      message: "Alph recommends this broker for your next load",
      fixLabel: "Create Load",
      fixAction: "createLoad",
    });
  }

  const severityOrder: Record<BrokerAlphAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return results
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);
}

export function detectDashboardBrokerAlphInsights(
  brokers: Broker[],
): BrokerAlphAlert[] {
  const insights: BrokerAlphAlert[] = [];
  const recommended = brokers.filter(
    (broker) => broker.recommended && broker.status === "active",
  );
  const creditRisk = brokers.filter(
    (broker) =>
      broker.status === "credit_hold" ||
      broker.outstandingBalance > 25000 ||
      (broker.latePaymentCount ?? 0) >= 2,
  );

  if (recommended.length > 0) {
    const names = recommended
      .slice(0, 3)
      .map((broker) => broker.name)
      .join(", ");
    insights.push({
      id: "dashboard-recommended",
      severity: "info",
      message: `Recommended brokers: ${names}`,
      fixLabel: "Create Load",
      fixAction: "createLoad",
    });
  }

  if (creditRisk.length > 0) {
    insights.push({
      id: "dashboard-credit",
      severity: creditRisk.some((b) => b.status === "credit_hold")
        ? "critical"
        : "warning",
      message: `${creditRisk.length} broker${creditRisk.length === 1 ? "" : "s"} need credit attention`,
      fixLabel: "View Payments",
      fixAction: "viewPayments",
    });
  }

  return insights.slice(0, 3);
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
