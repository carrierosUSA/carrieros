import DriverDashboardSkeleton from "@/components/drivers/DriverDashboardSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function DriversLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <DriverDashboardSkeleton />
      </div>
    </div>
  );
}
