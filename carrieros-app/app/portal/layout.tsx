"use client";

import type { ReactNode } from "react";
import PortalProvider from "@/components/portal/PortalProvider";

export default function PortalRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PortalProvider>
      <div className="min-h-dvh bg-[#F5F7FA] text-[#111827]">{children}</div>
    </PortalProvider>
  );
}
