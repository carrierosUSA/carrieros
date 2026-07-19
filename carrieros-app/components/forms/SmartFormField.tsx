"use client";

type SmartFormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
  autoFilled?: boolean;
  readOnly?: boolean;
};

export function SmartFormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  autoFilled = false,
  readOnly = false,
}: SmartFormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
        {label}
        {autoFilled ? (
          <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
            Auto-filled
          </span>
        ) : null}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        readOnly={readOnly}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] ${
          autoFilled
            ? "border-[#BFDBFE] bg-[#F8FBFF]"
            : "border-[#EAEAEA] bg-white"
        } ${readOnly ? "cursor-default text-slate-600" : ""}`}
      />
    </label>
  );
}

type SmartSelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  autoFilled?: boolean;
};

export function SmartSelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  autoFilled = false,
}: SmartSelectFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
        {label}
        {autoFilled ? (
          <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
            Auto-filled
          </span>
        ) : null}
      </span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] ${
          autoFilled
            ? "border-[#BFDBFE] bg-[#F8FBFF]"
            : "border-[#EAEAEA] bg-white"
        }`}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SmartFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
