"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  buildLoadsHref,
  type DispatchSearchParams,
} from "@/lib/dispatch/load-board";

type DispatchPaginationProps = {
  params: DispatchSearchParams;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  for (
    let value = Math.max(2, current - 1);
    value <= Math.min(total - 1, current + 1);
    value += 1
  ) {
    pages.push(value);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);
  return pages;
}

export default function DispatchPagination({
  params,
  total,
  page,
  pageSize,
  totalPages,
}: DispatchPaginationProps) {
  const router = useRouter();
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const pages = pageNumbers(page, totalPages);

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2 text-[11px] text-slate-500">
      <p className="font-medium tabular-nums">
        {start}–{end} of {total}
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={
            page > 1 ? buildLoadsHref(params, { page: String(page - 1) }) : "#"
          }
          aria-disabled={page <= 1}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${
            page > 1
              ? "border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              : "pointer-events-none border-transparent bg-transparent text-slate-300"
          }`}
        >
          ‹
        </Link>

        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={entry}
              href={buildLoadsHref(params, { page: String(entry) })}
              className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold ${
                entry === page
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "border border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {entry}
            </Link>
          ),
        )}

        <Link
          href={
            page < totalPages
              ? buildLoadsHref(params, { page: String(page + 1) })
              : "#"
          }
          aria-disabled={page >= totalPages}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${
            page < totalPages
              ? "border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              : "pointer-events-none border-transparent bg-transparent text-slate-300"
          }`}
        >
          ›
        </Link>
      </div>

      <select
        value={String(pageSize)}
        onChange={(event) => {
          router.push(
            buildLoadsHref(params, {
              pageSize: event.target.value,
              page: "1",
            }),
          );
        }}
        className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 text-[11px] font-medium text-slate-700 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-blue-100"
        aria-label="Rows per page"
      >
        <option value="12">12 rows</option>
        <option value="15">15 rows</option>
        <option value="18">18 rows</option>
        <option value="20">20 rows</option>
        <option value="25">25 rows</option>
      </select>
    </div>
  );
}
