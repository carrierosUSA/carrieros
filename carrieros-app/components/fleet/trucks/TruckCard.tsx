"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  MoreHorizontal,
  Phone,
  UserPlus,
  Wrench,
} from "lucide-react";
import TruckStatusBadge from "@/components/fleet/TruckStatusBadge";
import {
  getActiveLoadsForTruck,
  getTruckOperationalStatus,
} from "@/lib/fleet/truck-board";
import type { Load, Truck } from "@/lib/types";

type TruckCardProps = {
  truck: Truck;
  loads: Load[];
  driverName?: string;
  driverPhone?: string;
};

function shortenVin(vin: string) {
  if (vin.length <= 8) return vin;
  return `…${vin.slice(-8)}`;
}

function TruckPhoto({ truck }: { truck: Truck }) {
  if (truck.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={truck.photoUrl}
        alt=""
        className="h-14 w-14 rounded-[12px] object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#EFF6FF] text-[14px] font-bold text-[#2563EB]"
      aria-hidden
    >
      {truck.unitNumber}
    </div>
  );
}

export default function TruckCard({
  truck,
  loads,
  driverName,
  driverPhone,
}: TruckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = getTruckOperationalStatus(truck, loads);
  const activeLoads = getActiveLoadsForTruck(truck.id, loads);
  const load = activeLoads[0];

  const warnings: string[] = [];
  if (status === "in_shop") warnings.push("In shop");
  if (status === "out_of_service") warnings.push("Out of service");
  if (!truck.driverId) warnings.push("No driver");
  if (truck.lastServiceDate) {
    const days =
      (Date.now() - new Date(`${truck.lastServiceDate}T12:00:00Z`).getTime()) /
      (1000 * 60 * 60 * 24);
    if (days > 90) warnings.push("Service overdue");
  }

  return (
    <div className="group relative rounded-[16px] bg-white p-4 shadow-[inset_0_0_0_1px_#EAEAEA] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <Link href={`/fleet/trucks/${truck.id}`} className="block focus-visible:outline-none">
        <div className="flex items-start gap-3">
          <TruckPhoto truck={truck} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[16px] font-semibold text-[#111827] group-hover:text-[#2563EB]">
                Unit {truck.unitNumber}
              </h3>
              <TruckStatusBadge status={status} />
            </div>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {truck.year} {truck.make} {truck.model}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
          <div>
            <dt className="font-medium text-[#94A3B8]">Driver</dt>
            <dd className="truncate font-semibold text-[#111827]">
              {driverName ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#94A3B8]">Load</dt>
            <dd className="truncate font-semibold text-[#111827]">
              {load?.reference ?? load?.loadNumber ?? "None"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#94A3B8]">Location</dt>
            <dd className="truncate font-semibold text-[#111827]">
              {truck.location ?? "Location unknown"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#94A3B8]">Plate</dt>
            <dd className="font-semibold text-[#111827]">{truck.licensePlate}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-medium text-[#94A3B8]">VIN</dt>
            <dd className="font-semibold text-[#111827]">{shortenVin(truck.vin)}</dd>
          </div>
        </dl>

        {warnings.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {warnings.map((w) => (
              <span
                key={w}
                className="rounded-[8px] bg-[#FFF7ED] px-2 py-0.5 text-[12px] font-semibold text-[#EA580C]"
              >
                {w}
              </span>
            ))}
          </div>
        ) : null}
      </Link>

      <div className="absolute right-3 top-3">
        <button
          type="button"
          aria-label="Truck actions"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="grid h-8 w-8 place-items-center rounded-[8px] text-[#94A3B8] opacity-100 transition hover:bg-[#F8F9FB] hover:text-[#2563EB] sm:opacity-0 sm:group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-48 rounded-[12px] bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)] ring-1 ring-[#EAEAEA]"
          >
            <Link
              href={`/fleet/trucks/${truck.id}`}
              role="menuitem"
              className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
              onClick={() => setMenuOpen(false)}
            >
              View
            </Link>
            <Link
              href={`/fleet/trucks/${truck.id}?tab=driver`}
              role="menuitem"
              className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
              onClick={() => setMenuOpen(false)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assign Driver
            </Link>
            <Link
              href={`/loads/new?truckId=${truck.id}`}
              role="menuitem"
              className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
              onClick={() => setMenuOpen(false)}
            >
              Assign Load
            </Link>
            <Link
              href="/fleet/maintenance"
              role="menuitem"
              className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
              onClick={() => setMenuOpen(false)}
            >
              <Wrench className="h-3.5 w-3.5" />
              Open Maintenance
            </Link>
            <Link
              href={`/fleet/trucks/${truck.id}?tab=documents`}
              role="menuitem"
              className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
              onClick={() => setMenuOpen(false)}
            >
              <FileText className="h-3.5 w-3.5" />
              View Documents
            </Link>
            {driverPhone ? (
              <a
                href={`tel:${driverPhone}`}
                role="menuitem"
                className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#F8F9FB]"
                onClick={() => setMenuOpen(false)}
              >
                <Phone className="h-3.5 w-3.5" />
                Contact Driver
              </a>
            ) : (
              <span
                role="menuitem"
                aria-disabled
                title="No driver phone on file"
                className="flex cursor-not-allowed items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#94A3B8]"
              >
                <Phone className="h-3.5 w-3.5" />
                Contact Driver
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
