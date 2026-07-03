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
      <div className="rounded-b-[1.5rem] bg-white p-10 text-center">
        <p className="text-lg font-semibold text-slate-950">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-b-[1.5rem] bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-slate-400">
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
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const href = getRowHref?.(row);

            return (
              <tr
                key={getRowKey(row)}
                className="group transition hover:bg-blue-50/40"
              >
                {columns.map((column, index) => {
                  const content = column.render(row);
                  const cell = (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap px-4 py-4 text-slate-700 ${
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                            ? "text-center"
                            : "text-left"
                      }`}
                    >
                      {content}
                    </td>
                  );

                  if (href && index === 0) {
                    return (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-4 py-4 text-left"
                      >
                        <Link href={href} className="block">
                          {content}
                        </Link>
                      </td>
                    );
                  }

                  return cell;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
