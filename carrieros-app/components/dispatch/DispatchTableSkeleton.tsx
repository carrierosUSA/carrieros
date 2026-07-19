import Skeleton from "@/components/ui/Skeleton";

export default function DispatchTableSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-88px)] min-h-[620px] flex-col overflow-hidden bg-white">
      <div className="px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-32 rounded-[12px]" />
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-28 shrink-0 rounded-[12px]" />
          ))}
        </div>
      </div>
      <div className="px-4 py-3 lg:px-5">
        <Skeleton className="h-10 rounded-[12px]" />
      </div>
      <div className="min-h-0 flex-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="flex h-14 items-center gap-3 border-b border-[#F1F5F9] px-4"
          >
            <Skeleton className="h-3 w-4" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="hidden h-4 w-32 md:block" />
            <Skeleton className="hidden h-4 w-24 lg:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
