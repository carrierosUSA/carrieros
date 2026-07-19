"use client";

const SHORTCUTS = [
  { key: "N", label: "New load" },
  { key: "D", label: "Dispatch" },
  { key: "I", label: "Invoice" },
  { key: "P", label: "POD" },
  { key: "B", label: "Broker" },
  { key: "G", label: "GPS" },
  { key: "Esc", label: "Close" },
] as const;

type KeyboardShortcutHintsProps = {
  variant?: "global" | "load";
};

export default function KeyboardShortcutHints({
  variant = "global",
}: KeyboardShortcutHintsProps) {
  const items =
    variant === "load"
      ? SHORTCUTS
      : SHORTCUTS.filter((item) => item.key === "N" || item.key === "D");

  return (
    <div
      aria-label="Keyboard shortcuts"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400"
    >
      {items.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-[#EAEAEA] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">
            {item.key}
          </kbd>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}
