"use client";

type IftaGenerateButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
};

export default function IftaGenerateButton({
  label,
  onClick,
  disabled,
  title,
}: IftaGenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
