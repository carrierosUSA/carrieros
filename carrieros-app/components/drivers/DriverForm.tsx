import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import type { Driver, Truck } from "@/lib/types";
import {
  DRIVER_PAY_TYPE_LABELS,
  DRIVER_STATUSES,
  DRIVER_STATUS_LABELS,
} from "@/lib/types";

type DriverFormProps = {
  action: (formData: FormData) => Promise<void>;
  trucks: Truck[];
  driver?: Driver;
  submitLabel: string;
};

export default function DriverForm({
  action,
  trucks,
  driver,
  submitLabel,
}: DriverFormProps) {
  const statusOptions = DRIVER_STATUSES.map((status) => ({
    value: status,
    label: DRIVER_STATUS_LABELS[status],
  }));

  const payTypeOptions = Object.entries(DRIVER_PAY_TYPE_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  const truckOptions = [
    { value: "", label: "Unassigned" },
    ...trucks.map((truck) => ({
      value: truck.id,
      label: `Unit ${truck.unitNumber}`,
    })),
  ];

  return (
    <form action={action} className="grid gap-6">
      <FormSection title="Driver Profile" description="Personal and employment details.">
        <FormField label="Full Name" name="name" defaultValue={driver?.name} required />
        <FormField label="Email" name="email" type="email" defaultValue={driver?.email} required />
        <FormField label="Role" name="role" defaultValue={driver?.role} required />
        <SelectField
          label="Status"
          name="status"
          options={statusOptions}
          defaultValue={driver?.status ?? "active"}
          required
        />
        <FormField label="Phone" name="phone" defaultValue={driver?.phone} required />
        <FormField label="Location" name="location" defaultValue={driver?.location} required />
        <FormField
          label="Hire Date"
          name="hireDate"
          type="date"
          defaultValue={driver?.hireDate}
          required
        />
        <SelectField
          label="Assigned Truck"
          name="truckId"
          options={truckOptions}
          defaultValue={driver?.truckId ?? ""}
        />
      </FormSection>

      <FormSection title="Compliance" description="License and medical card tracking.">
        <FormField
          label="License Class"
          name="licenseClass"
          defaultValue={driver?.licenseClass}
          required
        />
        <FormField
          label="License Number"
          name="licenseNumber"
          defaultValue={driver?.licenseNumber}
          required
        />
        <FormField
          label="License State"
          name="licenseState"
          defaultValue={driver?.licenseState}
          required
        />
        <FormField
          label="License Expires"
          name="licenseExpiresAt"
          type="date"
          defaultValue={driver?.licenseExpiresAt}
          required
        />
        <FormField
          label="Medical Expires"
          name="medicalExpiresAt"
          type="date"
          defaultValue={driver?.medicalExpiresAt}
          required
        />
      </FormSection>

      <FormSection title="Payroll" description="Compensation configuration.">
        <FormField
          label="Pay Rate"
          name="payRate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={driver?.payRate?.toString()}
          required
        />
        <SelectField
          label="Pay Type"
          name="payType"
          options={payTypeOptions}
          defaultValue={driver?.payType ?? "per_mile"}
          required
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
