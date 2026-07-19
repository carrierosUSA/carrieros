"use client";

type TrailerSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export default function TrailerSearchBar({
  value,
  onChange,
  resultCount,
}: TrailerSearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden
        >
          ⌕
        </span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search unit, VIN, plate, type, make..."
          className="h-10 w-full rounded-xl bg-[#F8FAFC] pl-9 pr-4 text-[14px] text-slate-900 ring-1 ring-[#EAEAEA] transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
        />
      </div>
      <p className="shrink-0 text-[13px] font-medium text-slate-500">
        {resultCount} trailer{resultCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
