import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import type { LoadStop } from "@/lib/types";

type LoadStopFieldsProps = {
  title: string;
  prefix: "origin" | "destination";
  stop?: LoadStop;
};

export default function LoadStopFields({
  title,
  prefix,
  stop,
}: LoadStopFieldsProps) {
  return (
    <FormSection title={title} description="City, state, and optional appointment time.">
        <FormField
          label="City"
          name={`${prefix}City`}
          defaultValue={stop?.city}
          placeholder="San Antonio"
          required
        />
        <FormField
          label="State"
          name={`${prefix}State`}
          defaultValue={stop?.state}
          placeholder="TX"
          required
        />
        <FormField
          label="Scheduled At"
          name={`${prefix}ScheduledAt`}
          type="datetime-local"
          defaultValue={
            stop?.scheduledAt ? toDateTimeLocalValue(stop.scheduledAt) : undefined
          }
        />
      </FormSection>
  );
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
