import { formatPayRate } from "@/lib/services/drivers/driver-helpers";
import type { Driver, DriverPayrollRecord } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverPayrollTabProps = {
  driver: Driver;
  payroll: DriverPayrollRecord[];
};

export default function DriverPayrollTab({ driver, payroll }: DriverPayrollTabProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#E5E7EB]">
        <h2 className="text-[15px] font-semibold text-slate-950">Pay Configuration</h2>
        <p className="mt-2 text-[14px] text-slate-600">
          {formatPayRate(driver)} · {driver.payType.replace("_", " ")}
        </p>
      </section>

      {payroll.length === 0 ? (
        <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#E5E7EB]">
          <p className="text-[15px] font-semibold text-slate-900">No payroll records yet</p>
        </section>
      ) : (
        <section className="space-y-3">
          {payroll.map((record) => (
            <div
              key={record.id}
              className="rounded-[16px] bg-white p-4 ring-1 ring-[#E5E7EB]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-slate-950">{record.period}</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${
                    record.status === "paid"
                      ? `${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text} ${CARRIEROS_COLORS.success.border}`
                      : `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text} ${CARRIEROS_COLORS.warning.border}`
                  }`}
                >
                  {record.status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
                <div>
                  <dt className="text-slate-500">Gross</dt>
                  <dd className="font-bold text-slate-900">
                    ${record.grossPay.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Deductions</dt>
                  <dd className="font-bold text-slate-900">
                    ${record.deductions.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Net Pay</dt>
                  <dd className="font-bold text-slate-900">
                    ${record.netPay.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
