type AIPartnerProps = {
  name: string;
};

export default function AIPartner({ name }: AIPartnerProps) {
  return (
    <div className="rounded-2xl border border-blue-900/50 bg-blue-950/40 p-6">
      <h2 className="text-xl font-semibold text-blue-300">
        Hello, I&apos;m {name}.
      </h2>

      <p className="mt-2 text-zinc-400">How can I help you today?</p>
    </div>
  );
}
