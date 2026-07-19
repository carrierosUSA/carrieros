export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-[#E8ECF2]" />
        <div className="h-8 w-64 rounded-lg bg-[#E8ECF2]" />
        <div className="h-4 w-96 max-w-full rounded bg-[#F1F5F9]" />
      </div>
      <div className="h-[200px] rounded-[18px] bg-white p-5 ring-1 ring-[#E8ECF2]">
        <div className="mb-4 h-9 w-48 rounded-xl bg-[#EFF6FF]" />
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[14px] bg-[#F5F7FA]" />
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-[18px] bg-white p-5 ring-1 ring-[#E8ECF2]">
        <div className="h-10 rounded-xl bg-[#F5F7FA]" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-[#F5F7FA]" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-[14px] bg-[#F8F9FB]" />
        ))}
      </div>
    </div>
  );
}
