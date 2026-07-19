import Skeleton from "@/components/ui/Skeleton";

export default function MaintenanceDashboardSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="h-[140px] rounded-[14px]" />
      <Skeleton className="h-10 rounded-full" />
      <Skeleton className="h-11 rounded-[12px]" />
      <Skeleton className="h-12 rounded-[14px]" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[88px] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
