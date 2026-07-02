type ButtonProps = {
  title: string;
};

export default function Button({ title }: ButtonProps) {
  return (
    <button className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500">
      {title}
    </button>
  );
}
