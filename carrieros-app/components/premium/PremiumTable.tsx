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
    <div className="overflow-hidden rounded-2xl border border-slate-200/75">
      <table className="w-full border-collapse bg-white text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-400">
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
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const href = getRowHref?.(row);
            const content = columns.map((column) => (
              <td
                key={column.key}
                className={`px-4 py-4 ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.render(row)}
              </td>
            ));

            if (href) {
              return (
                <tr
                  key={getRowKey(row)}
                  className="cursor-pointer transition hover:bg-slate-50"
                >
                  {content}
                </tr>
              );
            }

            return (
              <tr key={getRowKey(row)} className="transition hover:bg-slate-50">
                {content}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
