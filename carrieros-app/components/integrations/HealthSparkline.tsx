type HealthSparklineProps = {
  values: number[];
  className?: string;
};

/** Tiny SVG sparkline for success-rate samples (0–100). */
export default function HealthSparkline({
  values,
  className = "",
}: HealthSparklineProps) {
  if (values.length < 2) {
    return (
      <div
        className={`flex h-8 items-center text-[12px] text-slate-400 ${className}`}
      >
        No samples yet
      </div>
    );
  }

  const width = 120;
  const height = 32;
  const pad = 2;
  const min = 0;
  const max = 100;
  const step = (width - pad * 2) / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = pad + i * step;
      const y =
        height - pad - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const last = values[values.length - 1] ?? 0;
  const stroke =
    last >= 95 ? "#16A34A" : last >= 80 ? "#EA580C" : "#DC2626";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-8 w-[120px] ${className}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
