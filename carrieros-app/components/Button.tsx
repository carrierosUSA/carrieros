type ButtonProps = {
  title: string;
};

export default function Button({ title }: ButtonProps) {
  return (
    <button className="rounded-xl bg-blue-900 px-5 py-3 text-white font-medium transition hover:bg-blue-800">
      {title}
    </button>
  );
}