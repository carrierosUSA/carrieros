import Card from "@/components/Card";
import type { DriverPerformanceMetric } from "@/lib/types";

type DriverPerformanceCardProps = {
  metric: DriverPerformanceMetric;
};

const trendLabels = {
  up: "↑ Improving",
  down: "↓ Declining",
  stable: "→ Stable",
};

export default function DriverPerformanceCard({ metric }: DriverPerformanceCardProps) {
  return (
    <Card>
      <p className="text-sm text-zinc-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-100">{metric.value}</p>
      <p className="mt-2 text-sm text-blue-400">{trendLabels[metric.trend]}</p>
    </Card>
  );
}
