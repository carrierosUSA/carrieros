type TrackingTemperatureCardProps = {
  temperature?: string;
};

export default function TrackingTemperatureCard({
  temperature = "Service ready",
}: TrackingTemperatureCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm font-semibold text-blue-400">Temperature</p>
      <p className="mt-2 text-2xl font-bold text-zinc-100">{temperature}</p>
      <p className="mt-2 text-sm text-zinc-400">
        Reefer temperature telemetry is service-ready for future ELD/GPS
        integrations.
      </p>
    </section>
  );
}
