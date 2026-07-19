export default function DriverSkeleton() {
  return (
    <div className="min-h-dvh bg-[#F5F7FA] p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80" />
        <div className="h-40 animate-pulse rounded-[22px] bg-slate-200/80" />
        <div className="h-28 animate-pulse rounded-[22px] bg-slate-200/80" />
        <div className="h-28 animate-pulse rounded-[22px] bg-slate-200/80" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 animate-pulse rounded-[22px] bg-slate-200/80" />
          <div className="h-24 animate-pulse rounded-[22px] bg-slate-200/80" />
        </div>
      </div>
    </div>
  );
}
