export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <h1 className="text-xl font-bold text-blue-900">
        Transpo.ai
      </h1>

      <div className="flex items-center gap-8 text-gray-700">
        <a href="#">Home</a>
        <a href="#">Operations</a>
        <a href="#">Team</a>
        <a href="#">Fleet</a>
        <a href="#">Finance</a>
        <a href="#">Documents</a>
        <a href="#">AI</a>
      </div>
    </nav>
  );
}