import Skeleton from "@/components/ui/Skeleton";

export default function CompanyDashboardSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-[14px]" />
      <Skeleton className="h-10 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[300px] rounded-[16px]" />
        ))}
      </div>
    </div>
  );
}
