import type { ReactNode } from "react";

export const LOAD_DETAIL_CARD_CLASS =
  "rounded-[14px] border border-[#EAEAEA] bg-white p-5 shadow-sm";

export const LOAD_DETAIL_CARD_TITLE_CLASS =
  "text-[14px] font-semibold text-slate-900";

type LoadDetailCardProps = {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
  children: ReactNode;
};

export default function LoadDetailCard({
  title,
  icon,
  action,
  className = "",
  id,
  children,
}: LoadDetailCardProps) {
  return (
    <section id={id} className={`${LOAD_DETAIL_CARD_CLASS} ${className}`.trim()}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className={`${LOAD_DETAIL_CARD_TITLE_CLASS} flex items-center gap-2`}>
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
