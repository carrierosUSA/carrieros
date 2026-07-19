"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalLoginForm from "@/components/portal/auth/PortalLoginForm";
import { usePortal } from "@/components/portal/PortalProvider";
import { getPendingPortal2FA } from "@/lib/portal/session";

function LoginInner() {
  const { session, ready } = usePortal();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (session) {
      router.replace("/portal/dashboard");
      return;
    }
    if (getPendingPortal2FA()) {
      router.replace("/portal/verify-2fa");
    }
  }, [ready, session, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <PortalLoginForm />
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#F5F7FA]" />
      }
    >
      <LoginInner />
    </Suspense>
  );
}
