"use client";

import { Suspense } from "react";
import PortalVerify2FAForm from "@/components/portal/auth/PortalVerify2FAForm";

export default function PortalVerify2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#F5F7FA]" />
      }
    >
      <div className="flex min-h-dvh items-center justify-center px-4 py-10">
        <PortalVerify2FAForm />
      </div>
    </Suspense>
  );
}
