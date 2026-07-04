type TableToolbarProps = {
  title?: string;
  searchPlaceholder?: string;
  filters?: string[];
  activeFilter?: string;
  resultCount?: number;
  bulkActionLabel?: string;
};

export default function TableToolbar({
  title = "Records",
  searchPlaceholder = "Search",
  filters = ["All"],
  activeFilter = "All",
  resultCount,
  bulkActionLabel = "Bulk actions",
}: TableToolbarProps) {
  return (
    <div className="rounded-t-[16px] border-b border-[#DDE2EA] bg-[#F5F7FA] px-4 py-3">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {typeof resultCount === "number" ? (
            <p className="mt-1 text-sm text-[#6B7280]">{resultCount} records</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-xl border border-[#DDE2EA] bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 lg:w-72"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  filter === activeFilter
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#DDE2EA] bg-white text-slate-700 hover:border-blue-200 hover:text-[#111827]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          {["Sort", "Export", "Resize", "Hide Columns", "Open Details", "Edit"].map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-xl border border-[#DDE2EA] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#111827]"
            >
              {action === "Export" ? bulkActionLabel : action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
