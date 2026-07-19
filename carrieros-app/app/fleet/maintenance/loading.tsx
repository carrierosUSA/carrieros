import FleetSubNav from "@/components/fleet/FleetSubNav";
import MaintenanceDashboardSkeleton from "@/components/fleet/maintenance/MaintenanceDashboardSkeleton";

export default function MaintenanceLoading() {
  return (
    <div className="min-h-[60vh] rounded-[16px] bg-[#F5F7FA] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-6">
        <div className="h-[88px] rounded-[16px] bg-white/60 ring-1 ring-[#EAEAEA]" />
        <FleetSubNav />
        <MaintenanceDashboardSkeleton />
      </div>
    </div>
  );
}
