type SettingsFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function SettingsField({
  label,
  hint,
  children,
  className = "",
}: SettingsFieldProps) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-[13px] text-slate-500">{hint}</span> : null}
    </label>
  );
}

export const settingsInputClass =
  "w-full rounded-[12px] bg-[#F8FAFC] px-3.5 py-2.5 text-[15px] text-slate-950 outline-none ring-1 ring-[#EAEAEA] transition placeholder:text-slate-400 focus:bg-white focus:ring-[#2563EB]";

export const settingsSelectClass = settingsInputClass;

export const settingsTextareaClass = `${settingsInputClass} min-h-[120px] resize-y leading-relaxed`;

type SettingsPanelFrameProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function SettingsPanelFrame({
  title,
  description,
  children,
  footer,
}: SettingsPanelFrameProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-[14px] text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

type SaveButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  saving?: boolean;
  saved?: boolean;
  disabledReason?: string;
};

export function SettingsSaveButton({
  onClick,
  disabled,
  saving,
  saved,
  disabledReason,
}: SaveButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || saving}
      title={disabled && disabledReason ? disabledReason : undefined}
      className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
    >
      {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
    </button>
  );

  if (disabled && disabledReason) {
    return (
      <span title={disabledReason} className="inline-flex">
        {button}
      </span>
    );
  }

  return button;
}
