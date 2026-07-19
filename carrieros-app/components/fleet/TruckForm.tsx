import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import type { Driver, Truck } from "@/lib/types";
import { TRUCK_STATUSES, TRUCK_STATUS_LABELS } from "@/lib/types";

type TruckFormProps = {
  action: (formData: FormData) => Promise<void>;
  drivers: Driver[];
  truck?: Truck;
  submitLabel: string;
};

export default function TruckForm({
  action,
  drivers,
  truck,
  submitLabel,
}: TruckFormProps) {
  const statusOptions = TRUCK_STATUSES.map((status) => ({
    value: status,
    label: TRUCK_STATUS_LABELS[status],
  }));

  const driverOptions = [
    { value: "", label: "Unassigned" },
    ...drivers.map((driver) => ({
      value: driver.id,
      label: driver.name,
    })),
  ];

  return (
    <form action={action} className="grid gap-6">
      <FormSection
        title="Truck Details"
        description="Unit information, registration, and operational status."
      >
        <FormField
          label="Unit Number"
          name="unitNumber"
          defaultValue={truck?.unitNumber}
          placeholder="102"
          required
        />
        <SelectField
          label="Status"
          name="status"
          options={statusOptions}
          defaultValue={truck?.status ?? "available"}
          required
        />
        <FormField
          label="Make"
          name="make"
          defaultValue={truck?.make}
          placeholder="Freightliner"
          required
        />
        <FormField
          label="Model"
          name="model"
          defaultValue={truck?.model}
          placeholder="Cascadia"
          required
        />
        <FormField
          label="Year"
          name="year"
          type="number"
          min="1990"
          max="2099"
          defaultValue={truck?.year?.toString()}
          required
        />
        <FormField
          label="VIN"
          name="vin"
          defaultValue={truck?.vin}
          placeholder="1FUJGHDV8NLBT1021"
          required
        />
        <FormField
          label="License Plate"
          name="licensePlate"
          defaultValue={truck?.licensePlate}
          placeholder="TX-FLT102"
          required
        />
        <FormField
          label="License State"
          name="licenseState"
          defaultValue={truck?.licenseState}
          placeholder="TX"
        />
        <FormField
          label="Mileage"
          name="mileage"
          type="number"
          min="0"
          defaultValue={truck?.mileage?.toString()}
          required
        />
        <SelectField
          label="Assigned Driver"
          name="driverId"
          options={driverOptions}
          defaultValue={truck?.driverId ?? ""}
        />
        <FormField
          label="Location"
          name="location"
          defaultValue={truck?.location}
          placeholder="San Antonio, TX"
        />
        <FormField
          label="Last Service Date"
          name="lastServiceDate"
          type="date"
          defaultValue={truck?.lastServiceDate}
        />
      </FormSection>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
