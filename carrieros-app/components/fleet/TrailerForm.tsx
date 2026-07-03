import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import type { Trailer, Truck } from "@/lib/types";
import { TRAILER_STATUSES, TRAILER_STATUS_LABELS } from "@/lib/types";

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
        <FormField
          label="Type"
          name="type"
          defaultValue={trailer?.type}
          placeholder="Dry Van"
          required
        />
        <SelectField
          label="Status"
          name="status"
          options={statusOptions}
          defaultValue={trailer?.status ?? "available"}
          required
        />
        <FormField
          label="License Plate"
          name="licensePlate"
          defaultValue={trailer?.licensePlate}
          placeholder="TX-TRL2201"
          required
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
