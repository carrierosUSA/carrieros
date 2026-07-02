import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import AIPartner from "@/components/AIPartner";

export default function Home() {
  return (
    <>
      <div className="mb-10">
        <p className="text-sm font-medium text-blue-400">Welcome back</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-100">
          Guru Kirpa Transport Inc.
        </h1>
        <p className="mt-3 text-zinc-400">Everything looks good today.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Today&apos;s Operations</p>
                <h2 className="mt-1 text-2xl font-semibold text-zinc-100">
                  Command Center
                </h2>
              </div>
              <Badge text="All Clear" type="success" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Active Loads" value="14" />
              <Metric title="Drivers" value="2" />
              <Metric title="Trucks" value="8" />
              <Metric title="Invoices" value="6" />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="font-semibold text-zinc-100">Operations</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Loads, dispatch, tracking.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-zinc-100">Fleet</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Trucks, trailers, maintenance.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-zinc-100">Finance</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Invoices, payments, payroll.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-zinc-100">Documents</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Rate cons, PODs, permits.
              </p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <AIPartner name="Nova" />

          <Card>
            <h3 className="font-semibold text-zinc-100">Quick Actions</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button title="Ask AI Partner" />
              <Button title="Create Load" />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}
