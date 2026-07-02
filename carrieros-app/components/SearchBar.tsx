type SearchBarProps = {
  placeholder: string;
};

export default function SearchBar({ placeholder }: SearchBarProps) {
  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 shadow-sm">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-zinc-100 outline-none placeholder:text-zinc-500"
      />
    </div>
  );
}
