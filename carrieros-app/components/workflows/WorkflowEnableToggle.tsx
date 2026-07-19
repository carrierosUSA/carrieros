"use client";

type WorkflowEnableToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export default function WorkflowEnableToggle({
  enabled,
  onChange,
  disabled = false,
}: WorkflowEnableToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(!enabled);
      }}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
        enabled ? "bg-[#16A34A]" : "bg-[#CBD5E1]"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <span className="sr-only">{enabled ? "Enabled" : "Disabled"}</span>
    </button>
  );
}
