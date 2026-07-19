"use client";

import { getDriverById } from "@/lib/data/driver-store";
import { getTruckById } from "@/lib/data/fleet-store";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import { formatGallons, formatMoney } from "@/lib/ifta/board";
import type { IftaFuelPurchase } from "@/lib/ifta/types";

type IftaFuelViewProps = {
  purchases: IftaFuelPurchase[];
};

export default function IftaFuelView({ purchases }: IftaFuelViewProps) {
  if (purchases.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-10 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-800">
          No fuel purchases this quarter
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {purchases.map((purchase) => {
        const truck = getTruckById(purchase.truckId);
        const driver = purchase.driverId
          ? getDriverById(purchase.driverId)
          : undefined;
        const missing = purchase.receiptStatus === "missing";
        const duplicate = purchase.receiptStatus === "duplicate_suspect";

        return (
          <div
            key={purchase.id}
            className={`rounded-[14px] px-4 py-4 ring-1 ${
              missing
                ? `${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.border}`
                : duplicate
                  ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`
                  : "bg-white ring-[#EAEAEA]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-slate-950">
                  {purchase.vendor}
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-slate-500">
                  {purchase.date} · {purchase.state} · Unit{" "}
                  {truck?.unitNumber ?? "—"}
                  {driver ? ` · ${driver.name}` : ""}
                </p>
              </div>
              <ReceiptBadge status={purchase.receiptStatus} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <Metric
                label="Gallons"
                value={formatGallons(purchase.gallons)}
              />
              <Metric
                label="Price"
                value={formatMoney(purchase.pricePerGallon)}
              />
              <Metric label="Total" value={formatMoney(purchase.totalCost)} />
              {purchase.receiptUrl && !missing ? (
                <a
                  href={purchase.receiptUrl}
                  className="ml-auto inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
                  onClick={(e) => {
                    // Stub receipt — prevent navigation to missing asset
                    e.preventDefault();
                  }}
                  title="Receipt stub on file"
                >
                  View receipt
                </a>
              ) : missing ? (
                <span
                  className={`ml-auto inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold ${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.text}`}
                >
                  Receipt needed
                </span>
              ) : null}
            </div>
            {purchase.notes ? (
              <p className="mt-2 text-[13px] font-medium text-slate-600">
                {purchase.notes}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ReceiptBadge({
  status,
}: {
  status: IftaFuelPurchase["receiptStatus"];
}) {
  if (status === "missing") {
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${CARRIEROS_COLORS.critical.bg} ${CARRIEROS_COLORS.critical.text}`}
      >
        Missing
      </span>
    );
  }
  if (status === "duplicate_suspect") {
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text}`}
      >
        Duplicate?
      </span>
    );
  }
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text}`}
    >
      Attached
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-[14px] font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
