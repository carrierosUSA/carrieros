type AIPartnerProps = {
  name: string;
};

export default function AIPartner({ name }: AIPartnerProps) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <h2 className="text-xl font-semibold text-blue-900">
        Hello, I&apos;m {name}.
      </h2>

      <p className="mt-2 text-gray-700">
        How can I help you today?
      </p>
    </div>
  );
}
