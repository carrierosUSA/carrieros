"use client";

import { useEffect } from "react";
import IssueRecovery from "@/components/support/IssueRecovery";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function WalletError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Wallet]", error);
  }, [error]);

  return <IssueRecovery error={error} reset={reset} source="Digital Professional Wallet" />;
}
