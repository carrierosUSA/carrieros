import Skeleton from "@/components/ui/Skeleton";

export default function FinanceDashboardSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] rounded-[14px]" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-28 rounded-[14px]" />
      <Skeleton className="h-11 rounded-[14px]" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[76px] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
