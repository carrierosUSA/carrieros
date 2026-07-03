import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import LoadStopFields from "@/components/loads/LoadStopFields";
import type { Broker, Customer, Load } from "@/lib/types";
import { LOAD_STATUSES, LOAD_STATUS_LABELS } from "@/lib/types";

type LoadFormProps = {
  action: (formData: FormData) => Promise<void>;
  customers: Customer[];
  brokers: Broker[];
  load?: Load;
  submitLabel: string;
  includeStatus?: boolean;
};

export default function LoadForm({
  action,
  customers,
  brokers,
  load,
  submitLabel,
  includeStatus = false,
}: LoadFormProps) {
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const brokerOptions = [
    { value: "", label: "Direct (no broker)" },
    ...brokers.map((broker) => ({
      value: broker.id,
      label: broker.name,
    })),
  ];

  const statusOptions = LOAD_STATUSES.map((status) => ({
    value: status,
    label: LOAD_STATUS_LABELS[status],
  }));

  return (
    <form action={action} className="grid gap-6">
      <FormSection
        title="Load Details"
        description="Customer, broker, rate, and lane mileage."
      >
        <SelectField
          label="Customer"
          name="customerId"
          options={customerOptions}
          defaultValue={load?.customerId}
          placeholder="Select customer"
          required
        />
        <SelectField
          label="Broker"
          name="brokerId"
          options={brokerOptions}
          defaultValue={load?.brokerId ?? ""}
        />
        <FormField
          label="Pickup Date"
          name="pickupDate"
          type="date"
          defaultValue={load?.pickupDate}
          required
        />
        <FormField
          label="Delivery Date"
          name="deliveryDate"
          type="date"
          defaultValue={load?.deliveryDate}
          required
        />
        <FormField
          label="Rate (USD)"
          name="rate"
          type="number"
          min="0"
          step="1"
          defaultValue={load?.rate?.toString()}
          required
        />
        <FormField
          label="Miles"
          name="miles"
          type="number"
          min="0"
          step="1"
          defaultValue={load?.miles?.toString()}
          required
        />
        {includeStatus ? (
          <SelectField
            label="Status"
            name="status"
            options={statusOptions}
            defaultValue={load?.status}
            required
          />
        ) : null}
      </FormSection>

      <div className="grid gap-6">
        <LoadStopFields title="Pickup Stop" prefix="origin" stop={load?.origin} />
        <LoadStopFields
          title="Delivery Stop"
          prefix="destination"
          stop={load?.destination}
        />
      </div>

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
