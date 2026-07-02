import PageHeader from "@/components/PageHeader";
import NovaAlert from "@/components/NovaAlert";
import DriverCard from "@/components/DriverCard";
import { drivers } from "@/lib/data/drivers";

export default function DriversPage() {
  return (
    <>
      <PageHeader
        title="Driver Management"
        subtitle="Manage drivers, licenses, medical cards, assignments, and alerts."
        action={
          <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            + Add Driver
          </button>
        }
      />

      <NovaAlert message="All driver documents look good. No urgent expirations found." />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {drivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>
    </>
  );
}
