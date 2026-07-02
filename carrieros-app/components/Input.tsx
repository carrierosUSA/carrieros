type InputProps = {
  placeholder: string;
};

export default function Input({ placeholder }: InputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-900"
    />
  );
}