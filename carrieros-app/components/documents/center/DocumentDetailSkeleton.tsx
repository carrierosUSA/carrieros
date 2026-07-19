import Skeleton from "@/components/ui/Skeleton";

export default function DocumentDetailSkeleton() {
  return (
    <div className="space-y-5 bg-[#F5F7FA] p-1">
      <Skeleton className="h-5 w-40 rounded-full" />
      <Skeleton className="h-48 rounded-[16px]" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-[16px]" />
    </div>
  );
}
