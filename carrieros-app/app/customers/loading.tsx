export default function CustomersLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <div className="h-16 animate-pulse rounded-[14px] bg-[#F5F7FA]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-28 animate-pulse rounded-[16px] bg-[#F5F7FA]" />
          <div className="h-28 animate-pulse rounded-[16px] bg-[#F5F7FA]" />
          <div className="h-28 animate-pulse rounded-[16px] bg-[#F5F7FA]" />
        </div>
      </div>
    </div>
  );
}
