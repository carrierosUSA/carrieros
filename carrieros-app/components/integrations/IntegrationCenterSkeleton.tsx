import Skeleton from "@/components/ui/Skeleton";

export default function IntegrationCenterSkeleton() {
  return (
    <div className="space-y-6 bg-[#F5F7FA] p-1">
      <Skeleton className="h-[120px] rounded-[16px]" />
      <Skeleton className="h-10 w-full max-w-2xl rounded-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[260px] rounded-[16px]" />
        ))}
      </div>
      <Skeleton className="h-[180px] rounded-[16px]" />
      <Skeleton className="h-[280px] rounded-[16px]" />
    </div>
  );
}
