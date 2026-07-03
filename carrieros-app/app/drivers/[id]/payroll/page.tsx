import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import PayrollRecordCard from "@/components/drivers/PayrollRecordCard";
import { requireDriver } from "@/lib/drivers/require-driver";
import { formatCurrency } from "@/lib/services/fleet/fleet-helpers";
import { formatPayRate } from "@/lib/services/drivers/driver-helpers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverPayrollPage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const records = await getDriverService().listPayroll(getActiveTenantId(), id);
  const totalNet = records.reduce((sum, record) => sum + record.netPay, 0);

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Payroll" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Pay Rate" value={formatPayRate(driver)} />
        <MetricCard title="Pay Periods" value={records.length.toString()} />
        <MetricCard title="Total Net Pay" value={formatCurrency(totalNet)} />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {records.map((record) => (
          <PayrollRecordCard key={record.id} record={record} driverName={driver.name} />
        ))}
      </div>
    </>
  );
}
