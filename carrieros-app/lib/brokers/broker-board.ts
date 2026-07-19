import type { Broker, BrokerStatus, Load } from "@/lib/types";
import { getBrokerContact } from "@/lib/data/brokers";

export type BrokerDashboardStats = {
  totalBrokers: number;
  active: number;
  inactive: number;
  creditHold: number;
  avgPaymentDays: number;
  totalRevenue: number;
  outstandingBalance: number;
};

export function buildBrokerDashboardStats(
  brokers: Broker[],
): BrokerDashboardStats {
  let active = 0;
  let inactive = 0;
  let creditHold = 0;
  let paymentDaysSum = 0;
  let totalRevenue = 0;
  let outstandingBalance = 0;

  for (const broker of brokers) {
    if (broker.status === "active") {
      active += 1;
    } else if (broker.status === "inactive") {
      inactive += 1;
    } else if (broker.status === "credit_hold") {
      creditHold += 1;
    }

    paymentDaysSum += broker.avgPaymentDays;
    totalRevenue += broker.totalRevenue;
    outstandingBalance += broker.outstandingBalance;
  }

  return {
    totalBrokers: brokers.length,
    active,
    inactive,
    creditHold,
    avgPaymentDays:
      brokers.length > 0 ? Math.round(paymentDaysSum / brokers.length) : 0,
    totalRevenue,
    outstandingBalance,
  };
}

export function filterBrokersByQuery(brokers: Broker[], query: string): Broker[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return brokers;
  }

  return brokers.filter((broker) => {
    const dispatcher = getBrokerContact(broker, "dispatcher");
    const accounting = getBrokerContact(broker, "accounting");
    const safety = getBrokerContact(broker, "safety");

    return [
      broker.name,
      broker.mcNumber ?? "",
      broker.dotNumber ?? "",
      broker.phone ?? "",
      broker.email ?? "",
      broker.website ?? "",
      broker.homeBase ?? "",
      broker.status,
      dispatcher?.name ?? "",
      accounting?.name ?? "",
      safety?.name ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
}

export function filterBrokersByStatus(
  brokers: Broker[],
  status: BrokerStatus | "all",
): Broker[] {
  if (status === "all") {
    return brokers;
  }

  return brokers.filter((broker) => broker.status === status);
}

export function getBrokerLoads(brokerId: string, loads: Load[]): Load[] {
  return loads.filter((load) => load.brokerId === brokerId);
}

export function formatBrokerMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPaymentDays(days: number): string {
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function formatBrokerRating(rating?: number): string {
  if (typeof rating !== "number") {
    return "—";
  }

  return `${rating.toFixed(1)} / 5`;
}

export function formatPerformanceScore(score?: number): string {
  if (typeof score !== "number") {
    return "—";
  }

  return `${Math.round(score)}%`;
}

export function formatBrokerDate(iso?: string): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getRecommendedBrokers(brokers: Broker[]): Broker[] {
  return brokers
    .filter((broker) => broker.recommended && broker.status === "active")
    .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0));
}
