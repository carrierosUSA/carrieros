type NovaAlertProps = {
  title?: string;
  message: string;
  className?: string;
};

export default function NovaAlert({
  title = "Nova Alert",
  message,
  className = "mt-8",
}: NovaAlertProps) {
  return (
    <div
      className={`rounded-2xl border border-blue-900/50 bg-blue-950/40 p-5 ${className}`}
    >
      <p className="text-sm font-semibold text-blue-300">{title}</p>
      <p className="mt-1 text-sm text-blue-400/80">{message}</p>
    </div>
  );
}
