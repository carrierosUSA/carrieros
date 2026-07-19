export default function AdminSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1280px] space-y-5">
        <div className="rounded-[16px] bg-[#F5F7FA] px-5 py-4">
          <div className="h-3 w-24 rounded bg-[#E2E8F0]" />
          <div className="mt-3 h-7 w-56 rounded bg-[#E2E8F0]" />
          <div className="mt-2 h-4 w-80 max-w-full rounded bg-[#E2E8F0]" />
        </div>
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          <div className="flex gap-2 lg:w-[200px] lg:flex-col lg:gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-28 rounded-xl bg-[#F1F5F9] lg:w-full" />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-40 rounded bg-[#E2E8F0]" />
            <div className="h-4 w-72 max-w-full rounded bg-[#E2E8F0]" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-[14px] bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
