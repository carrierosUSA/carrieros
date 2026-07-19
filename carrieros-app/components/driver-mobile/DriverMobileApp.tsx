"use client";

import { Suspense } from "react";
import DriverMobileShell, { useDriverTab } from "@/components/driver-mobile/DriverMobileShell";
import HomeDashboard from "@/components/driver-mobile/HomeDashboard";
import LoadsList from "@/components/driver-mobile/LoadsList";
import DocumentsUpload from "@/components/driver-mobile/DocumentsUpload";
import MessagesView from "@/components/driver-mobile/MessagesView";
import ProfileView from "@/components/driver-mobile/ProfileView";

function DriverTabContent() {
  const tab = useDriverTab();
  switch (tab) {
    case "loads":
      return <LoadsList />;
    case "documents":
      return <DocumentsUpload />;
    case "messages":
      return <MessagesView />;
    case "profile":
      return <ProfileView />;
    default:
      return <HomeDashboard />;
  }
}

export default function DriverMobileApp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[var(--dm-bg,#F5F7FA)] p-4">
          <div className="mx-auto max-w-lg space-y-4">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80" />
            <div className="h-40 animate-pulse rounded-[22px] bg-slate-200/80" />
            <div className="h-28 animate-pulse rounded-[22px] bg-slate-200/80" />
          </div>
        </div>
      }
    >
      <DriverMobileShell>
        <DriverTabContent />
      </DriverMobileShell>
    </Suspense>
  );
}
