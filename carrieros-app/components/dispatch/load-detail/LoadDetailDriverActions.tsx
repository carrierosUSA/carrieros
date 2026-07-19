"use client";

import { useState } from "react";
import CommunicationActionButtons from "@/components/dispatch/load-detail/communication/CommunicationActionButtons";

type LoadDetailDriverActionsProps = {
  phone?: string;
  email?: string;
  driverAssigned: boolean;
  onReassign: () => void;
};

export default function LoadDetailDriverActions({
  phone,
  email,
  driverAssigned,
  onReassign,
}: LoadDetailDriverActionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  function needDriver() {
    setFeedback("Assign a driver first.");
  }

  return (
    <div className="mt-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
        <CommunicationActionButtons
          phone={phone}
          email={email}
          partyLabel="Driver"
          disabled={!driverAssigned}
          onDisabledClick={needDriver}
          className="contents"
        />
      </div>
      <button
        type="button"
        onClick={onReassign}
        className="mt-3 text-[11px] font-semibold text-[#1E3A8A] hover:underline"
      >
        {driverAssigned ? "Reassign Driver" : "Assign Driver"}
      </button>
      {feedback ? <p className="mt-1 text-[10px] text-emerald-700">{feedback}</p> : null}
    </div>
  );
}
