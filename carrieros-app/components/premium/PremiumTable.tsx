import Link from "next/link";

type PremiumTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right";
};

type PremiumTableProps<T> = {
  columns: PremiumTableColumn<T>[];
  rows: T[];
  getRowHref?: (row: T) => string;
  getRowKey: (row: T) => string;
};

export default function PremiumTable<T>({
  columns,
  rows,
  getRowHref,
  getRowKey,
}: PremiumTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#DDE2EA] shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <table className="w-full border-collapse bg-white text-sm">
        <thead className="bg-[#F8F9FB] text-[11px] uppercase tracking-[0.14em] text-[#6B7280]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-semibold ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] text-slate-700">
          {rows.map((row) => {
            const href = getRowHref?.(row);
            const content = columns.map((column) => (
              <td
                key={column.key}
                className={`p-0 ${column.align === "right" ? "text-right" : "text-left"}`}
              >
                {href ? (
                  <Link href={href} className="block px-4 py-3.5">
                    {column.render(row)}
                  </Link>
                ) : (
                  <div className="px-4 py-3.5">{column.render(row)}</div>
                )}
              </td>
            ));

            if (href) {
              return (
                <tr
                  key={getRowKey(row)}
                  className="cursor-pointer transition duration-150 hover:bg-blue-50/70"
                >
                  {content}
                </tr>
              );
            }

            return (
              <tr key={getRowKey(row)} className="transition duration-150 hover:bg-blue-50/70">
                {content}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
