type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
};

export default function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required = false,
  min,
  max,
  step,
}: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
      />
    </label>
  );
}
