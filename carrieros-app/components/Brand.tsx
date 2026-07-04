export default function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center rounded-[14px] bg-white shadow-lg shadow-blue-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-blue-50 to-blue-100" />
        <div className="relative h-5 w-5 rounded-lg bg-slate-950">
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
        </div>
      </div>

      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-950">CarrierOS</h1>

        <p className="text-xs font-medium tracking-wide text-slate-500">
          Carrier Command System
        </p>
      </div>
    </div>
  );
}
