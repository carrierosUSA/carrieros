export default function AlphCommandCenterSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-[24px] bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-[#EFF6FF]" />
          <div className="mx-auto h-10 w-64 animate-pulse rounded-xl bg-[#F1F5F9] sm:w-80" />
          <div className="mx-auto h-4 w-80 max-w-full animate-pulse rounded bg-[#F1F5F9]" />
          <div className="mx-auto mt-6 h-14 max-w-2xl animate-pulse rounded-2xl bg-[#F5F7FA]" />
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-36 animate-pulse rounded-full bg-[#F1F5F9]"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="h-48 animate-pulse rounded-[20px] bg-white" />
        <div className="h-64 animate-pulse rounded-[20px] bg-[#F8FAFC]" />
      </div>
    </div>
  );
}
