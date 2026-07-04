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
    <div className="flex flex-col gap-3 rounded-b-[14px] border-t border-[#E5E7EB] bg-[#F8F9FB] px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {start}-{end} of {total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-medium text-slate-500"
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-medium text-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
