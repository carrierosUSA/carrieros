import Skeleton from "@/components/ui/Skeleton";

export default function LoadDetailSkeleton() {
  return (
    <div className="w-full animate-[carrieros-fade-in_0.35s_ease-out_both] bg-[#F5F7FA]">
      <div className="mb-3 rounded-[14px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-14 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mb-3 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[14px] border border-[#EAEAEA] bg-white p-5 shadow-sm"
          >
            <Skeleton className="mb-4 h-4 w-28" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
