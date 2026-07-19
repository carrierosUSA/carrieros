import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import type { Trailer, Truck } from "@/lib/types";
import {
  TRAILER_STATUSES,
  TRAILER_STATUS_LABELS,
  TRAILER_TYPES,
  TRAILER_TYPE_LABELS,
} from "@/lib/types";

type TrailerFormProps = {
  action: (formData: FormData) => Promise<void>;
  trucks: Truck[];
  trailer?: Trailer;
  submitLabel: string;
};

export default function TrailerForm({
  action,
  trucks,
  trailer,
  submitLabel,
}: TrailerFormProps) {
  const statusOptions = TRAILER_STATUSES.map((status) => ({
    value: status,
    label: TRAILER_STATUS_LABELS[status],
  }));

  const typeOptions = TRAILER_TYPES.map((type) => ({
    value: type,
    label: TRAILER_TYPE_LABELS[type],
  }));

  const truckOptions = [
    { value: "", label: "Unassigned" },
    ...trucks.map((truck) => ({
      value: truck.id,
      label: `Unit ${truck.unitNumber}`,
    })),
  ];

  return (
    <form action={action} className="grid gap-6">
      <FormSection
        title="Trailer Details"
        description="Equipment type, registration, and assignment."
      >
        <FormField
          label="Unit Number"
          name="unitNumber"
          defaultValue={trailer?.unitNumber}
          placeholder="2201"
          required
        />
        <SelectField
          label="Type"
          name="type"
          options={typeOptions}
          defaultValue={trailer?.type ?? "dry_van"}
          required
        />
        <FormField
          label="Length (ft)"
          name="lengthFt"
          type="number"
          defaultValue={trailer?.lengthFt?.toString()}
          placeholder="53"
        />
        <SelectField
          label="Status"
          name="status"
          options={statusOptions}
          defaultValue={trailer?.status ?? "available"}
          required
        />
        <FormField
          label="VIN"
          name="vin"
          defaultValue={trailer?.vin}
          placeholder="1JJV532D5KL220101"
        />
        <FormField
          label="Year"
          name="year"
          type="number"
          defaultValue={trailer?.year?.toString()}
          placeholder="2022"
        />
        <FormField
          label="Make"
          name="make"
          defaultValue={trailer?.make}
          placeholder="Great Dane"
        />
        <FormField
          label="License Plate"
          name="licensePlate"
          defaultValue={trailer?.licensePlate}
          placeholder="TX-TRL2201"
          required
        />
        <FormField
          label="State"
          name="licenseState"
          defaultValue={trailer?.licenseState}
          placeholder="TX"
        />
        <SelectField
          label="Assigned Truck"
          name="truckId"
          options={truckOptions}
          defaultValue={trailer?.truckId ?? ""}
        />
        <FormField
          label="Location"
          name="location"
          defaultValue={trailer?.location}
          placeholder="San Antonio, TX"
        />
        <FormField
          label="Mileage"
          name="mileage"
          type="number"
          defaultValue={trailer?.mileage?.toString()}
          placeholder="100000"
        />
        <FormField
          label="Last Service Date"
          name="lastServiceDate"
          type="date"
          defaultValue={trailer?.lastServiceDate}
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
