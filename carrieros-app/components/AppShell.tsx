"use client";

import { usePathname } from "next/navigation";
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

  const isDashboard = pathname === "/";

  return (
    <div className={isDashboard ? "min-h-screen bg-slate-50 text-slate-950" : "min-h-screen bg-background text-foreground"}>
      <Sidebar />
      <main
        className={
          isDashboard
            ? "min-h-screen lg:ml-72"
            : "min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10"
        }
      >
        {children}
      </main>
    </div>
  );
}
