"use client";

import CopyToastProvider from "@/components/dispatch/load-detail/CopyToastProvider";
import LoadDetailCommunicationProvider from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationProvider";
import type { LoadEmailContext } from "@/lib/dispatch/communication";

type LoadDetailCommunicationShellProps = {
  loadContext: LoadEmailContext;
  children: React.ReactNode;
};

export default function LoadDetailCommunicationShell({
  loadContext,
  children,
}: LoadDetailCommunicationShellProps) {
  return (
    <CopyToastProvider>
      <LoadDetailCommunicationProvider loadContext={loadContext}>
        {children}
      </LoadDetailCommunicationProvider>
    </CopyToastProvider>
  );
}
