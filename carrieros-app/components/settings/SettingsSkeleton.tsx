export default function SettingsSkeleton() {
  return (
    <div className="w-full rounded-[16px] bg-[#F5F7FA] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1280px] space-y-5">
        <div className="h-[88px] animate-pulse rounded-[16px] bg-gradient-to-r from-[#E8ECF2] via-[#F3F5F8] to-[#E8ECF2] bg-[length:200%_100%]" />
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          <div className="hidden space-y-3 lg:block lg:w-[220px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-[10px] bg-gradient-to-r from-[#E8ECF2] via-[#F3F5F8] to-[#E8ECF2] bg-[length:200%_100%]"
              />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-3 rounded-[16px] bg-white p-5">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-gradient-to-r from-[#E8ECF2] via-[#F3F5F8] to-[#E8ECF2] bg-[length:200%_100%]" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-gradient-to-r from-[#E8ECF2] via-[#F3F5F8] to-[#E8ECF2] bg-[length:200%_100%]" />
            <div className="mt-4 h-40 animate-pulse rounded-[16px] bg-gradient-to-r from-[#E8ECF2] via-[#F3F5F8] to-[#E8ECF2] bg-[length:200%_100%]" />
            <div className="h-24 animate-pulse rounded-[16px] bg-gradient-to-r from-[#E8ECF2] via-[#F3F5F8] to-[#E8ECF2] bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
