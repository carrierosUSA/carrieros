import PageHeader from "@/components/PageHeader";

export default function DriverProfile() {
  return (
    <>
      <PageHeader title="Onkar Singh" subtitle="Driver Profile" />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="font-semibold text-zinc-100">Personal Information</h2>

          <div className="mt-4 space-y-2 text-zinc-300">
            <p>
              <strong className="text-zinc-100">Status:</strong> Active
            </p>
            <p>
              <strong className="text-zinc-100">Phone:</strong> 210-555-0000
            </p>
            <p>
              <strong className="text-zinc-100">License:</strong> CDL A
            </p>
            <p>
              <strong className="text-zinc-100">Medical:</strong> Valid until
              Dec 2026
            </p>
            <p>
              <strong className="text-zinc-100">Truck:</strong> Truck 102
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="font-semibold text-zinc-100">Nova AI</h2>

          <div className="mt-3 space-y-1 text-zinc-300">
            <p>✅ Driver is active.</p>
            <p>✅ CDL is valid.</p>
            <p>✅ Medical is valid.</p>
            <p>No urgent reminders.</p>
          </div>
        </div>
      </div>
    </>
  );
}
