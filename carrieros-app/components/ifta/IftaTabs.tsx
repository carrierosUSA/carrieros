"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IFTA_VIEWS, type IftaView } from "@/lib/ifta/types";

export function parseIftaView(value: string | undefined | null): IftaView {
  const valid = IFTA_VIEWS.map((v) => v.id);
  if (value && valid.includes(value as IftaView)) {
    return value as IftaView;
  }
  return "trucks";
}

type IftaTabsProps = {
  activeView: IftaView;
  readOnly?: boolean;
};

export default function IftaTabs({ activeView, readOnly }: IftaTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectView(view: IftaView) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "trucks") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  void readOnly;

  return (
    <nav
      aria-label="IFTA sections"
      className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#EAEAEA]"
    >
      {IFTA_VIEWS.map((tab) => {
        const active = tab.id === activeView;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectView(tab.id)}
            className={`shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
              active
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-[#EAEAEA]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
