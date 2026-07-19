type MaintenanceSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultHint?: string;
};

export default function MaintenanceSearchBar({
  value,
  onChange,
  resultHint,
}: MaintenanceSearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Search maintenance</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search work orders, parts, vendors, repairs…"
          className="h-11 w-full rounded-[12px] bg-[#F8FAFC] px-4 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] transition placeholder:text-slate-400 focus:bg-white focus:ring-[#2563EB]"
        />
      </label>
      {resultHint ? (
        <p className="shrink-0 text-[13px] font-medium text-slate-500">{resultHint}</p>
      ) : null}
    </div>
  );
}
