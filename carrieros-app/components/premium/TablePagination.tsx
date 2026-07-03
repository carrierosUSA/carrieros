type TablePaginationProps = {
  total: number;
  pageSize?: number;
};

export default function TablePagination({
  total,
  pageSize = 10,
}: TablePaginationProps) {
  const start = total === 0 ? 0 : 1;
  const end = Math.min(total, pageSize);

  return (
    <div className="flex flex-col gap-3 rounded-b-[1.5rem] border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {start}-{end} of {total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-500"
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
