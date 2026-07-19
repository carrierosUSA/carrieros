import Skeleton from "@/components/ui/Skeleton";

export default function IftaDashboardSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] rounded-[14px]" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-32 rounded-full" />
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
