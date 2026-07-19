import Link from "next/link";
import TruckCard from "@/components/fleet/trucks/TruckCard";
import type { Load, Truck } from "@/lib/types";

/** Legacy export — premium card lives under components/fleet/trucks. */
type LegacyTruckCardProps = {
  truck: Truck;
  driverName?: string;
  loads?: Load[];
};

export default function LegacyTruckCardBridge({
  truck,
  driverName,
  loads = [],
}: LegacyTruckCardProps) {
  return <TruckCard truck={truck} loads={loads} driverName={driverName} />;
}

export function TruckCardEditLink({ truckId }: { truckId: string }) {
  return (
    <Link
      href={`/fleet/trucks/${truckId}/edit`}
      className="text-sm font-medium text-[#2563EB]"
    >
      Edit
    </Link>
  );
}
