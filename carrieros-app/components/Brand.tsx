export default function Brand() {
  return (
    <div className="flex w-full min-w-0 items-center justify-center gap-3 lg:group-hover/sidebar:justify-start">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_8px_20px_rgba(37,99,235,0.12)]">
        <div className="absolute inset-0 rounded-[12px] bg-gradient-to-br from-white via-blue-50 to-blue-100" />
        <div className="relative h-[18px] w-[18px] rounded-[5px] bg-[#111827]">
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-2 ring-white" />
        </div>
      </div>

      <div className="min-w-0 lg:hidden">
        <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#111827]">
          CarrierOS
        </p>
        <p className="truncate text-[11px] font-medium text-[#6B7280]">
          Carrier Command System
        </p>
      </div>

      <div className="hidden min-w-0 flex-1 overflow-hidden lg:group-hover/sidebar:block">
        <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#111827]">
          CarrierOS
        </p>
        <p className="truncate text-[11px] font-medium leading-4 text-[#6B7280]">
          Carrier Command System
        </p>
      </div>
    </div>
  );
}
