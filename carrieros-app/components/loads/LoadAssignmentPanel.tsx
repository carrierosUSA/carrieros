import SelectField from "@/components/forms/SelectField";
import type { Driver, Truck } from "@/lib/types";
import { assignDriverAction, assignTruckAction } from "@/app/loads/actions";

type LoadAssignmentPanelProps = {
  loadId: string;
  drivers: Driver[];
  trucks: Truck[];
  currentDriverId?: string;
  currentTruckId?: string;
};

export default function LoadAssignmentPanel({
  loadId,
  drivers,
  trucks,
  currentDriverId,
  currentTruckId,
}: LoadAssignmentPanelProps) {
  const driverOptions = drivers.map((driver) => ({
    value: driver.id,
    label: `${driver.name} · ${driver.status}`,
  }));

  const truckOptions = trucks.map((truck) => ({
    value: truck.id,
    label: `Unit ${truck.unitNumber} · ${truck.status}`,
  }));

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="font-semibold text-zinc-100">Dispatch Assignment</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Assign driver and truck to move this load into dispatch.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form action={assignDriverAction.bind(null, loadId)} className="space-y-4">
          <SelectField
            label="Driver"
            name="driverId"
            options={driverOptions}
            defaultValue={currentDriverId}
            placeholder="Select driver"
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            Assign Driver
          </button>
        </form>

        <form action={assignTruckAction.bind(null, loadId)} className="space-y-4">
          <SelectField
            label="Truck"
            name="truckId"
            options={truckOptions}
            defaultValue={currentTruckId}
            placeholder="Select truck"
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            Assign Truck
          </button>
        </form>
      </div>
    </section>
  );
}
