import Skeleton from "@/components/ui/Skeleton";

export default function WorkflowDashboardSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[84px] rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="h-[140px] rounded-[18px]" />
      <Skeleton className="h-11 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[260px] rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}
