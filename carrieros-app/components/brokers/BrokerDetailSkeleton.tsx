import Skeleton from "@/components/ui/Skeleton";

export default function BrokerDetailSkeleton() {
  return (
    <div className="space-y-4 bg-[#F5F7FA] p-1">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-[160px] w-full rounded-[16px]" />
      <Skeleton className="h-24 w-full rounded-[14px]" />
      <Skeleton className="h-12 w-full rounded-[14px]" />
      <Skeleton className="h-[280px] w-full rounded-[16px]" />
    </div>
  );
}
