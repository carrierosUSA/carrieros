type NovaDriverInsightsProps = {
  insights: string[];
};

export default function NovaDriverInsights({ insights }: NovaDriverInsightsProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="font-semibold text-zinc-100">Nova AI Driver Insights</h2>
      <ul className="mt-4 space-y-2 text-sm text-zinc-300">
        {insights.map((insight) => (
          <li key={insight}>• {insight}</li>
        ))}
      </ul>
    </div>
  );
}
