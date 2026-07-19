"use client";

import IssueRecovery from "@/components/support/IssueRecovery";

export default function DriverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <IssueRecovery error={error} reset={reset} source="Transpo Driver App™" />
  );
}
