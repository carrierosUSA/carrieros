"use client";

import { Suspense } from "react";
import PortalLoads from "@/components/portal/loads/PortalLoads";

export default function PortalLoadsPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white" />}>
      <PortalLoads />
    </Suspense>
  );
}
