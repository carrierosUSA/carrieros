type MetricCardProps = {
  title: string;
  value: string;
};

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FB] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
