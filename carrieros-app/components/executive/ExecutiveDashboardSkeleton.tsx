import Skeleton from "@/components/ui/Skeleton";

function FiveCardRow({ prefix }: { prefix: string }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={`${prefix}-${index}`}
          className="h-[124px] rounded-[14px]"
        />
      ))}
    </div>
  );
}

export default function ExecutiveDashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-8 w-56 rounded-md sm:w-72" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="hidden h-10 w-32 rounded-xl sm:block" />
        </div>
      </div>

      <div className="rounded-[18px] bg-[#F5F7FA] p-4 sm:p-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-3 h-8 w-56 rounded-md" />
        <Skeleton className="mt-2 h-4 w-48 rounded-md" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={`brief-${index}`}
              className="h-[180px] rounded-[16px]"
            />
          ))}
        </div>
      </div>

      {(["fin", "ops", "fleet", "comp"] as const).map((prefix) => (
        <div key={prefix} className="space-y-3">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-4 w-52 rounded-md" />
          <FiveCardRow prefix={prefix} />
        </div>
      ))}

      <div className="space-y-3">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
        <Skeleton className="h-[280px] rounded-[16px]" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-56 rounded-md" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={`rec-${index}`}
              className="h-[120px] rounded-[14px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
