"use client";

import type { ReactNode } from "react";
import PortalAuthGuard from "@/components/portal/PortalAuthGuard";

export default function PortalAppLayout({ children }: { children: ReactNode }) {
  return <PortalAuthGuard>{children}</PortalAuthGuard>;
}
