import Skeleton from "@/components/ui/Skeleton";

export default function TruckDetailSkeleton() {
  return (
    <div className="space-y-4 bg-[#F5F7FA] p-1">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-[14px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-[14px]" />
      <Skeleton className="h-10 w-full rounded-[14px]" />
      <Skeleton className="h-[280px] w-full rounded-[16px]" />
    </div>
  );
}
