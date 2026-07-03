import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import type { DriverTimeOff } from "@/lib/types";
import { createTimeOffAction } from "@/app/drivers/actions";

type TimeOffRecordCardProps = {
  entry: DriverTimeOff;
};

export function TimeOffRecordCard({ entry }: TimeOffRecordCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">
            {entry.startDate} → {entry.endDate}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{entry.reason}</h2>
        </div>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold capitalize text-zinc-300">
          {entry.status}
        </span>
      </div>
    </div>
  );
}

type TimeOffFormProps = {
  driverId: string;
};

export function TimeOffForm({ driverId }: TimeOffFormProps) {
  return (
    <form action={createTimeOffAction.bind(null, driverId)} className="grid gap-6">
      <FormSection title="Request Time Off" description="Submit a new time off request.">
        <FormField label="Start Date" name="startDate" type="date" required />
        <FormField label="End Date" name="endDate" type="date" required />
        <FormField label="Reason" name="reason" required />
      </FormSection>
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
}
