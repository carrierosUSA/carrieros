"use client";

import { usePathname } from "next/navigation";
import { Bell, Building2, Plus, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPublicTracking = pathname.startsWith("/track/");

  if (isPublicTracking) {
    return <div className="min-h-screen bg-slate-50 text-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#DDE2EA] bg-[#F5F7FA]/95 px-3 py-4 backdrop-blur sm:px-4 lg:px-6">
            <div className="flex items-center justify-between rounded-[14px] border border-[#DDE2EA] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="hidden h-9 min-w-80 items-center gap-2 rounded-xl border border-[#DDE2EA] bg-[#F5F7FA] px-3 text-sm text-[#6B7280] md:flex">
                  <Search className="h-[17px] w-[17px]" strokeWidth={1.9} />
                  <span>Search loads, drivers, trucks, invoices...</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[#DDE2EA] bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Quick actions
                  </span>
                </button>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE2EA] bg-white text-slate-600 hover:border-blue-200"
                >
                  <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[#DDE2EA] bg-white px-3 py-2 text-sm font-semibold text-[#111827] hover:border-blue-200"
                >
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4" strokeWidth={1.9} />
                    Company
                  </span>
                </button>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
