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
    <div className="rounded-t-[1.5rem] border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {typeof resultCount === "number" ? (
            <p className="mt-1 text-sm text-slate-500">{resultCount} records</p>
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
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white lg:w-72"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  filter === activeFilter
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Sort
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            {bulkActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
