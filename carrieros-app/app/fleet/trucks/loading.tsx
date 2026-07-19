import TruckDashboardSkeleton from "@/components/fleet/trucks/TruckDashboardSkeleton";

export default function TrucksLoading() {
  return (
    <div className="min-h-[60vh] rounded-[16px] bg-[#F5F7FA] p-4 sm:p-5 lg:p-6">
      <TruckDashboardSkeleton />
    </div>
  );
}
