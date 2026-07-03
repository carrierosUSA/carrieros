import SelectField from "@/components/forms/SelectField";
import type { Truck } from "@/lib/types";
import { assignDriverAction } from "@/app/drivers/actions";

type DriverAssignmentFormProps = {
  driverId: string;
  trucks: Truck[];
  currentTruckId?: string;
};

export default function DriverAssignmentForm({
  driverId,
  trucks,
  currentTruckId,
}: DriverAssignmentFormProps) {
  const truckOptions = [
    { value: "", label: "Unassigned" },
    ...trucks.map((truck) => ({
      value: truck.id,
      label: `Unit ${truck.unitNumber} · ${truck.status}`,
    })),
  ];

  return (
    <form action={assignDriverAction.bind(null, driverId)} className="space-y-4">
      <SelectField
        label="Assigned Truck"
        name="truckId"
        options={truckOptions}
        defaultValue={currentTruckId ?? ""}
      />
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Save Assignment
      </button>
    </form>
  );
}
