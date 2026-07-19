"use client";

import { useState } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import {
  setMaintenanceMessage,
  setMaintenanceMode,
} from "@/lib/admin/maintenance";

type MaintenanceModeToggleProps = {
  onToast: (message: string) => void;
};

export default function MaintenanceModeToggle({
  onToast,
}: MaintenanceModeToggleProps) {
  const store = useAdminStore();
  const [message, setMessage] = useState(store.maintenanceMessage);
  const [confirmEnable, setConfirmEnable] = useState(false);

  function saveMessage() {
    const next = setMaintenanceMessage(message);
    setMessage(next);
    onToast("Maintenance message saved");
  }

  function enable() {
    setMaintenanceMode(true, message);
    setConfirmEnable(false);
    onToast("Maintenance mode enabled");
  }

  function disable() {
    setMaintenanceMode(false);
    setConfirmEnable(false);
    onToast("Maintenance mode disabled");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Maintenance mode
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          When on, non-admin users see a site-wide banner. Admins keep full
          access.
        </p>
      </div>

      <div
        className={`rounded-[14px] p-4 ring-1 ${
          store.maintenanceMode
            ? "bg-[#FFF7ED] ring-[#FED7AA]"
            : "bg-[#F8FAFC] ring-[#EAEAEA]"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[#111827]">
              {store.maintenanceMode
                ? "Maintenance is on"
                : "Maintenance is off"}
            </p>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              Banner appears above the app header for dispatchers and other
              roles.
            </p>
          </div>
          {store.maintenanceMode ? (
            <button
              type="button"
              onClick={disable}
              className="h-10 shrink-0 rounded-xl bg-[#16A34A] px-4 text-[13px] font-semibold text-white hover:bg-[#15803D]"
            >
              Turn off
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmEnable(true)}
              className="h-10 shrink-0 rounded-xl bg-[#EA580C] px-4 text-[13px] font-semibold text-white hover:bg-[#C2410C]"
            >
              Enable maintenance
            </button>
          )}
        </div>
      </div>

      {confirmEnable ? (
        <div className="rounded-[14px] border border-[#FED7AA] bg-[#FFF7ED] p-4">
          <p className="text-[14px] font-semibold text-[#9A3412]">
            Enable maintenance mode?
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#C2410C]">
            Non-admin users will see the banner until you turn this off.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={enable}
              className="h-9 rounded-xl bg-[#EA580C] px-3 text-[13px] font-semibold text-white hover:bg-[#C2410C]"
            >
              Confirm enable
            </button>
            <button
              type="button"
              onClick={() => setConfirmEnable(false)}
              className="h-9 rounded-xl bg-white px-3 text-[13px] font-semibold text-[#111827] ring-1 ring-[#EAEAEA]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-[#374151]">
          Banner message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[14px] text-[#111827] outline-none ring-[#2563EB] focus:ring-2"
        />
      </label>
      <button
        type="button"
        onClick={saveMessage}
        className="h-10 rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-[#111827] hover:bg-[#EEF2F7]"
      >
        Save message
      </button>
    </div>
  );
}
