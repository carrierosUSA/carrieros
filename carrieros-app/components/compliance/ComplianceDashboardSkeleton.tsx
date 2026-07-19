import Skeleton from "@/components/ui/Skeleton";

export default function ComplianceDashboardSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <Skeleton className="h-[100px] rounded-[16px]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="h-10 rounded-full" />
      <Skeleton className="h-12 rounded-[14px]" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[320px] rounded-[16px]" />
        <Skeleton className="h-[320px] rounded-[16px]" />
      </div>
    </div>
  );
}
