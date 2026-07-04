import Link from "next/link";

export type OperationalTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
};

type OperationalTableProps<T> = {
  rows: T[];
  columns: OperationalTableColumn<T>[];
  getRowKey: (row: T) => string;
  getRowHref?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function OperationalTable<T>({
  rows,
  columns,
  getRowKey,
  getRowHref,
  emptyTitle = "No records found",
  emptyDescription = "Adjust filters or create a new record.",
}: OperationalTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-b-[16px] bg-white p-8 text-center">
        <p className="text-lg font-semibold text-[#111827]">{emptyTitle}</p>
        <p className="mt-2 text-sm text-[#6B7280]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="border-b border-[#DDE2EA] bg-[#F5F7FA] text-xs uppercase tracking-[0.14em] text-[#6B7280]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`whitespace-nowrap px-4 py-3 font-semibold ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE2EA]">
          {rows.map((row) => {
            const href = getRowHref?.(row);

            return (
              <tr
                key={getRowKey(row)}
                className={`group transition hover:bg-blue-50/60 ${href ? "cursor-pointer" : ""}`}
              >
                {columns.map((column) => {
                  const content = column.render(row);

                  return (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap p-0 text-slate-800 ${
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                            ? "text-center"
                            : "text-left"
                      }`}
                    >
                      {href ? (
                        <Link href={href} className="block px-4 py-3">
                          {content}
                        </Link>
                      ) : (
                        <div className="px-4 py-3">{content}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
