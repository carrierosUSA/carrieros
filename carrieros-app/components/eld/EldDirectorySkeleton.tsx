export default function EldDirectorySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-[16px] bg-[#F5F7FA]" />
      <div className="flex gap-3">
        <div className="h-11 flex-1 rounded-xl bg-[#F5F7FA]" />
        <div className="h-11 w-40 rounded-xl bg-[#F5F7FA]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-[16px] bg-[#F5F7FA]" />
        ))}
      </div>
    </div>
  );
}
