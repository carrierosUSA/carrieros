export default function DocumentHealthLoading() {
  return (
    <div className="w-full rounded-[16px] bg-[#F5F7FA] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-6">
        <div className="h-24 animate-pulse rounded-[16px] bg-white/80" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[14px] bg-white/80"
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-[16px] bg-white/80" />
          <div className="h-56 animate-pulse rounded-[16px] bg-white/80" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-[14px] bg-white/80"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
