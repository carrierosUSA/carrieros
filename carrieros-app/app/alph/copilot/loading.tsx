export default function AlphCopilotLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <div className="h-3 w-28 animate-pulse rounded bg-[#E2E8F0]" />
        <div className="h-8 w-56 animate-pulse rounded bg-[#E2E8F0]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#F1F5F9]" />
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full bg-[#F1F5F9]"
            />
          ))}
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="h-64 animate-pulse rounded-[16px] bg-[#F5F7FA]" />
          <div className="h-64 animate-pulse rounded-[16px] bg-[#F5F7FA]" />
        </div>
      </div>
    </div>
  );
}
