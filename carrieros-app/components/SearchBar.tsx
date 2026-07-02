type SearchBarProps = {
  placeholder: string;
};

export default function SearchBar({ placeholder }: SearchBarProps) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full outline-none text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
}