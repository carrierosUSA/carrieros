type AlphDriverInsightsProps = {
  insights: string[];
};

/** @deprecated Prefer Alph naming — kept for existing imports */
export default function NovaDriverInsights({ insights }: AlphDriverInsightsProps) {
  return (
    <div className="rounded-[16px] bg-[#F8F9FB] p-5">
      <h2 className="text-[15px] font-semibold text-[#111827]">Alph Driver Insights</h2>
      <ul className="mt-3 space-y-2 text-[14px] text-[#6B7280]">
        {insights.map((insight) => (
          <li key={insight} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
