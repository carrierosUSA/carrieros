import { Suspense } from "react";
import IftaAccountantClient from "@/components/ifta/IftaAccountantClient";
import IftaDashboardSkeleton from "@/components/ifta/IftaDashboardSkeleton";

export default function IftaAccountantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FA] p-4 sm:p-6">
          <div className="mx-auto max-w-[1100px]">
            <IftaDashboardSkeleton />
          </div>
        </div>
      }
    >
      <IftaAccountantClient />
    </Suspense>
  );
}
