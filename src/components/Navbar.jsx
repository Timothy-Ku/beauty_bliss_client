import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-pink-100 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <h1 className="text-3xl font-extrabold text-pink-600 tracking-wide">Beauty Bliss</h1>
        <div className="flex gap-8 text-lg font-semibold text-gray-700">
          <Link to="/" className="hover:text-pink-500 transition duration-300 ease-in-out">
            Home
          </Link>
          <Link to="/tryon" className="hover:text-pink-500 transition duration-300 ease-in-out">
            Try-On
          </Link>
          <Link to="/routine" className="hover:text-pink-500 transition duration-300 ease-in-out">
            Routine
          </Link>
          <Link to="/tracker" className="hover:text-pink-500 transition duration-300 ease-in-out">
            Tracker
          </Link>
        </div>
      </div>
    </nav>
  );
}
