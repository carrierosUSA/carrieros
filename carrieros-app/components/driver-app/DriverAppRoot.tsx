"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { DriverAppProvider } from "@/components/driver-app/DriverAppProvider";
import DriverAppShell from "@/components/driver-app/DriverAppShell";
import DriverSkeleton from "@/components/driver-app/DriverSkeleton";
import { resolveDriverId } from "@/lib/driver-app/constants";

function DriverAppInner({ children }: { children: ReactNode }) {
  const sp = useSearchParams();
  const driverId = resolveDriverId({ driverId: sp.get("driverId") });
  return (
    <DriverAppProvider driverId={driverId}>
      <DriverAppShell>{children}</DriverAppShell>
    </DriverAppProvider>
  );
}

export default function DriverAppRoot({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DriverSkeleton />}>
      <DriverAppInner>{children}</DriverAppInner>
    </Suspense>
  );
}
