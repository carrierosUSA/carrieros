"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortal } from "@/components/portal/PortalProvider";
import PortalShell from "@/components/portal/PortalShell";
import type { ReactNode } from "react";

export default function PortalAuthGuard({ children }: { children: ReactNode }) {
  const { session, ready } = usePortal();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(`/portal/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, session, router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-dvh bg-[#F5F7FA] p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-10 w-48 animate-[carrieros-shimmer_1.4s_ease_infinite] rounded-xl bg-[linear-gradient(90deg,#e8ecf2_0%,#f8f9fb_50%,#e8ecf2_100%)] bg-[length:200%_100%]" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-[carrieros-shimmer_1.4s_ease_infinite] rounded-2xl bg-[linear-gradient(90deg,#e8ecf2_0%,#f8f9fb_50%,#e8ecf2_100%)] bg-[length:200%_100%]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <PortalShell>{children}</PortalShell>;
}
