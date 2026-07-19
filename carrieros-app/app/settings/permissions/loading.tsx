export default function PermissionsLoading() {
  return (
    <div className="space-y-6 bg-[#F5F7FA]">
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-[#E5E7EB]" />
        <div className="h-9 w-56 animate-pulse rounded-lg bg-[#E5E7EB]" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[#E5E7EB]" />
      </div>
      <div className="h-11 animate-pulse rounded-[14px] bg-[#E5E7EB]" />
      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-2xl bg-[#E5E7EB]" />
        <div className="h-80 animate-pulse rounded-2xl bg-[#E5E7EB]" />
      </div>
    </div>
  );
}
