import { Suspense } from "react";
import SupportCenterClient from "@/components/support/SupportCenterClient";

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-32 rounded-[16px] bg-white" />
          <div className="h-64 rounded-[16px] bg-white" />
        </div>
      }
    >
      <SupportCenterClient />
    </Suspense>
  );
}
