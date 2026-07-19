"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  FileText,
  MoreHorizontal,
  Phone,
  Truck,
  UserPlus,
  Wrench,
} from "lucide-react";
import type { FleetInventoryRow } from "@/lib/fleet/fleet-dashboard";

type FleetUnitActionsMenuProps = {
  row: FleetInventoryRow;
};

type MenuAction = {
  key: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  reason?: string;
};

export default function FleetUnitActionsMenu({ row }: FleetUnitActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isTruck = row.assetKind === "truck";
  const baseHref = row.detailHref;

  const actions: MenuAction[] = [
    {
      key: "details",
      label: "View Details",
      href: baseHref,
    },
    {
      key: "assign-driver",
      label: "Assign Driver",
      href: isTruck
        ? `${baseHref}?tab=driver`
        : row.truckAssignedId
          ? `/fleet/trucks/${row.truckAssignedId}?tab=driver`
          : undefined,
      icon: <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />,
      disabled: !isTruck && !row.truckAssignedId,
      reason:
        !isTruck && !row.truckAssignedId
          ? "Assign this trailer to a truck first"
          : undefined,
    },
    {
      key: "assign-trailer",
      label: "Assign Trailer",
      href: isTruck ? `${baseHref}?tab=overview` : undefined,
      icon: <Truck className="h-3.5 w-3.5" strokeWidth={2} />,
      disabled: !isTruck,
      reason: !isTruck
        ? "Assign trailers from a truck unit"
        : undefined,
    },
    {
      key: "assign-load",
      label: "Assign Load",
      href: isTruck
        ? `/loads/new?truckId=${row.id}`
        : row.truckAssignedId
          ? `/loads/new?truckId=${row.truckAssignedId}`
          : undefined,
      disabled: !isTruck && !row.truckAssignedId,
      reason:
        !isTruck && !row.truckAssignedId
          ? "Assign this trailer to a truck first"
          : undefined,
    },
    {
      key: "change-status",
      label: "Change Status",
      href: isTruck ? `/fleet/trucks/${row.id}/edit` : `${baseHref}?tab=overview`,
    },
    {
      key: "maintenance",
      label: "Add Maintenance",
      href: isTruck
        ? `/fleet/maintenance?tab=pm&create=1&truck=${row.id}`
        : `${baseHref}?tab=maintenance`,
      icon: <Wrench className="h-3.5 w-3.5" strokeWidth={2} />,
    },
    {
      key: "document",
      label: "Upload Document",
      href: `${baseHref}?tab=documents`,
      icon: <FileText className="h-3.5 w-3.5" strokeWidth={2} />,
    },
    {
      key: "contact",
      label: "Contact Driver",
      href: row.driverPhone ? `tel:${row.driverPhone}` : undefined,
      icon: <Phone className="h-3.5 w-3.5" strokeWidth={2} />,
      disabled: !row.driverPhone,
      reason: row.driverName
        ? "No phone on file for this driver"
        : "No driver assigned",
    },
  ];

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={`Actions for ${row.assetTypeLabel} ${row.unitNumber}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="grid h-8 w-8 place-items-center rounded-[8px] text-[#94A3B8] transition hover:bg-[#F8F9FB] hover:text-[#2563EB]"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-30 mt-1 w-52 rounded-[12px] bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)] ring-1 ring-[#EAEAEA]"
        >
          {actions.map((action) => {
            if (action.disabled || !action.href) {
              return (
                <span
                  key={action.key}
                  role="menuitem"
                  aria-disabled
                  title={action.reason}
                  className="flex cursor-not-allowed flex-col gap-0.5 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#94A3B8]"
                >
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                  {action.reason ? (
                    <span className="pl-5 text-[12px] font-normal leading-snug text-[#CBD5E1]">
                      {action.reason}
                    </span>
                  ) : null}
                </span>
              );
            }

            if (action.href.startsWith("tel:")) {
              return (
                <a
                  key={action.key}
                  href={action.href}
                  role="menuitem"
                  className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
                  onClick={() => setOpen(false)}
                >
                  {action.icon}
                  {action.label}
                </a>
              );
            }

            return (
              <Link
                key={action.key}
                href={action.href}
                role="menuitem"
                className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
                onClick={() => setOpen(false)}
              >
                {action.icon}
                {action.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
