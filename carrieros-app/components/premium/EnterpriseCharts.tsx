import Link from "next/link";

type ChartPoint = {
  label: string;
  value: number;
};

type ChartProps = {
  data: ChartPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  href?: string;
};

const BLUE = "#2563EB";
const GRID = "#E5E7EB";
const TEXT = "#475569";

function formatValue(value: number, prefix = "", suffix = "") {
  if (prefix === "$") {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  }

  return `${prefix}${new Intl.NumberFormat("en-US").format(value)}${suffix}`;
}

function getLinePoints(data: ChartPoint[], width: number, height: number, padding = 34) {
  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return data.map((item, index) => ({
    x: padding + (index / Math.max(data.length - 1, 1)) * innerWidth,
    y: padding + (1 - (item.value - min) / range) * innerHeight,
    ...item,
  }));
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlDistance = (point.x - previous.x) * 0.42;
    return `${path} C ${previous.x + controlDistance} ${previous.y}, ${point.x - controlDistance} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function ChartFrame({
  title,
  subtitle,
  action,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex h-full min-h-[268px] flex-col rounded-[16px] border border-[#DDE2EA] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
      {href ? <Link href={href} className="absolute inset-0 z-0 rounded-[14px]" aria-label={`Open ${title} analytics`} /> : null}
      <div className="relative z-10 mb-3 flex items-start justify-between gap-3 pointer-events-none">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#111827]">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs font-medium text-[#6B7280]">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="relative z-10 flex flex-1 flex-col pointer-events-none">{children}</div>
    </div>
  );
}

export function EnterpriseLineChart({
  title,
  subtitle,
  data,
  height = 250,
  valuePrefix = "",
  valueSuffix = "",
  showMonthSelector = false,
  href,
}: ChartProps & {
  title: string;
  subtitle?: string;
  showMonthSelector?: boolean;
}) {
  const width = 760;
  const points = getLinePoints(data, width, height, 64);
  const latest = points[points.length - 1];
  const gradientId = `lineArea-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const areaPath =
    points.length > 0
      ? `${smoothPath(points)} L ${points[points.length - 1].x} ${height - 34} L ${points[0].x} ${height - 34} Z`
      : "";
  const yValues = [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
    const values = data.map((item) => item.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    return min + (max - min) * ratio;
  });

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      href={href}
      action={
        showMonthSelector ? (
          <span className="rounded-lg border border-[#DDE2EA] bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#374151]">
            This Month
          </span>
        ) : null
      }
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="min-h-0 flex-1 w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.18" />
            <stop offset="70%" stopColor={BLUE} stopOpacity="0.04" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yValues.map((value, index) => {
          const y = 34 + (index / 4) * (height - 68);
          return (
            <g key={`${value}-${index}`}>
              <line x1="62" x2={width - 24} y1={y} y2={y} stroke={GRID} strokeWidth="1" />
              <text x="14" y={y + 4} fill={TEXT} fontSize="11" fontWeight="600">
                {formatValue(value, valuePrefix, valueSuffix)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={smoothPath(points)} fill="none" stroke={BLUE} strokeWidth="3.2" strokeLinecap="round" />
        {latest ? (
          <g>
            <line x1={latest.x} x2={latest.x} y1="34" y2={height - 34} stroke={BLUE} strokeDasharray="3 5" strokeOpacity="0.24" />
            <circle cx={latest.x} cy={latest.y} r="5" fill={BLUE} stroke="#fff" strokeWidth="3" />
            <rect x={latest.x - 44} y={latest.y - 40} width="88" height="30" rx="10" fill="#111827" opacity="0.96" />
            <text x={latest.x} y={latest.y - 20} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle">
              {formatValue(latest.value, valuePrefix, valueSuffix)}
            </text>
          </g>
        ) : null}
        {data.map((item, index) => (
          <text
            key={item.label}
            x={64 + (index / Math.max(data.length - 1, 1)) * (width - 128)}
            y={height - 8}
            fill="#6B7280"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
          >
            {item.label}
          </text>
        ))}
      </svg>
    </ChartFrame>
  );
}

export function EnterpriseAreaChart({ title, subtitle, data, height = 220, valuePrefix = "", href }: ChartProps & { title: string; subtitle?: string }) {
  const width = 560;
  const points = getLinePoints(data, width, height, 48);
  const area = points.length
    ? `${smoothPath(points)} L ${width - 48} ${height - 34} L 48 ${height - 34} Z`
    : "";
  const latest = points[points.length - 1];
  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const yValues = [1, 0.5, 0].map((ratio) => min + (max - min) * ratio);
  const gradientId = `area-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

  return (
    <ChartFrame title={title} subtitle={subtitle} href={href}>
      <svg viewBox={`0 0 ${width} ${height}`} className="min-h-0 flex-1 w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.24" />
            <stop offset="62%" stopColor={BLUE} stopOpacity="0.06" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yValues.map((value, index) => {
          const y = 34 + (index / 2) * (height - 68);
          return (
            <g key={`${value}-${index}`}>
              <line x1="48" x2={width - 24} y1={y} y2={y} stroke={GRID} />
              <text x="8" y={y + 4} fill={TEXT} fontSize="11" fontWeight="600">
                {formatValue(value, valuePrefix)}
              </text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={smoothPath(points)} fill="none" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
        {latest ? (
          <g>
            <circle cx={latest.x} cy={latest.y} r="4.5" fill={BLUE} stroke="#fff" strokeWidth="3" />
            <rect x={latest.x - 40} y={latest.y - 36} width="80" height="26" rx="9" fill="#111827" opacity="0.96" />
            <text x={latest.x} y={latest.y - 19} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
              {formatValue(latest.value, valuePrefix)}
            </text>
          </g>
        ) : null}
        {data.map((item, index) => (
          <text
            key={item.label}
            x={48 + (index / Math.max(data.length - 1, 1)) * (width - 96)}
            y={height - 8}
            fill="#6B7280"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
          >
            {item.label}
          </text>
        ))}
      </svg>
    </ChartFrame>
  );
}

export function EnterpriseBarChart({ title, subtitle, data, valuePrefix = "", href }: ChartProps & { title: string; subtitle?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const yValues = [1, 0.5, 0].map((ratio) => max * ratio);

  return (
    <ChartFrame title={title} subtitle={subtitle} href={href}>
      <div className="relative flex min-h-0 flex-1">
        <svg viewBox="0 0 460 210" className="min-h-0 flex-1 w-full">
          {yValues.map((value, index) => {
            const y = 28 + index * 72;
            return (
              <g key={`${value}-${index}`}>
                <line x1="48" x2="438" y1={y} y2={y} stroke={GRID} />
                <text x="6" y={y + 4} fill={TEXT} fontSize="11" fontWeight="600">
                  {formatValue(value, valuePrefix)}
                </text>
              </g>
            );
          })}
          {data.map((item, index) => {
            const barWidth = 54;
            const x = 72 + index * 88;
            const barHeight = Math.max((item.value / max) * 136, 12);
            const y = 172 - barHeight;
            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="10"
                  fill={index === data.length - 1 ? BLUE : "#DBEAFE"}
                />
                <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="#111827" fontSize="11" fontWeight="700">
                  {formatValue(item.value, valuePrefix)}
                </text>
                <text x={x + barWidth / 2} y="198" textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="600">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </ChartFrame>
  );
}

export function EnterpriseDonutChart({
  title,
  subtitle,
  value,
  label,
  href,
}: {
  title: string;
  subtitle?: string;
  value: number;
  label: string;
  href?: string;
}) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <ChartFrame title={title} subtitle={subtitle} href={href}>
      <div className="flex flex-1 items-center justify-center py-1">
        <svg viewBox="0 0 120 120" className="h-28 w-28">
          <circle cx="60" cy="60" r={radius} fill="none" stroke={GRID} strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={BLUE}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="59" textAnchor="middle" fill="#0F172A" fontSize="22" fontWeight="700">
            {value}%
          </text>
          <text x="60" y="77" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
            {label}
          </text>
        </svg>
      </div>
    </ChartFrame>
  );
}

export function EnterpriseHorizontalBarChart({
  title,
  subtitle,
  data,
  href,
}: {
  title: string;
  subtitle?: string;
  data: ChartPoint[];
  href?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <ChartFrame title={title} subtitle={subtitle} href={href}>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
