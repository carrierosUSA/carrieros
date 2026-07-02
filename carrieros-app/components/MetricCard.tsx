type MetricCardProps = {
  title: string;
  value: string;
};

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}
