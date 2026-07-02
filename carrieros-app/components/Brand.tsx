export default function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full bg-blue-600"></div>
        <div className="absolute inset-2 rounded-full bg-white"></div>
        <div className="absolute inset-0 rounded-full border border-gray-200"></div>
        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-blue-600"></div>
      </div>

      <div>
        <h1 className="text-lg font-bold text-gray-900">
          CarrierOS
        </h1>

        <p className="text-xs tracking-wide text-gray-500">
          Transportation Operating System
        </p>
      </div>
    </div>
  );
}