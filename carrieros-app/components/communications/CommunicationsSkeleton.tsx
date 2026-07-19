export default function CommunicationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-14 rounded-[16px] bg-[#F5F7FA]" />
      <div className="h-11 rounded-xl bg-[#F5F7FA]" />
      <div className="flex gap-2">
        <div className="h-9 w-20 rounded-full bg-[#F5F7FA]" />
        <div className="h-9 w-20 rounded-full bg-[#F5F7FA]" />
        <div className="h-9 w-20 rounded-full bg-[#F5F7FA]" />
        <div className="h-9 w-24 rounded-full bg-[#F5F7FA]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-h-[520px] space-y-2 rounded-[20px] bg-[#F8F9FB] p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] rounded-2xl bg-[linear-gradient(90deg,#EEF2F7_0%,#F8FAFC_50%,#EEF2F7_100%)] bg-[length:200%_100%] animate-[carrieros-shimmer_1.4s_ease_infinite]"
            />
          ))}
        </div>
        <div className="min-h-[520px] rounded-[20px] bg-[#F5F7FA]" />
      </div>
    </div>
  );
}
