import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

/**
 * Shared empty state — purpose, why empty, and one clear next action.
 */
export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  const actionClassName =
    "transpo-btn-primary mt-4 inline-flex text-[14px]";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[16px] bg-[#F8F9FB] px-6 py-8 text-center ${className}`}
      role="status"
    >
      {Icon ? (
        <span className="mb-3 grid h-10 w-10 place-items-center rounded-[12px] bg-white text-[#2563EB] shadow-[inset_0_0_0_1px_#EAEAEA]">
          <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
        </span>
      ) : null}
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#111827]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#6B7280]">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={actionClassName}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <button type="button" onClick={onAction} className={actionClassName}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
