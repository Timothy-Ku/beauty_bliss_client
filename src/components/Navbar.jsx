import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-gradient-to-r from-pink-100 to-rose-200 py-4 shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <span className="text-3xl">💖</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-pink-600 tracking-wide">
            Beauty Bliss
          </h1>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-pink-600 focus:outline-none">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Links */}
        <div className={`
          md:flex md:gap-8 md:items-center md:static
          absolute top-16 left-0 w-full bg-pink-50 md:bg-transparent transition-all duration-300 ease-in-out z-50
          ${menuOpen ? "block p-4" : "hidden"}
        `}>
          <Link to="/" className="block py-2 text-lg font-medium text-gray-700 hover:text-pink-500">
            🏠 Home
          </Link>
          <Link to="/tryon" className="block py-2 text-lg font-medium text-gray-700 hover:text-pink-500">
            💄 Try-On
          </Link>
          <Link to="/routine" className="block py-2 text-lg font-medium text-gray-700 hover:text-pink-500">
            🧖‍♀️ Routine
          </Link>
          <Link to="/tracker" className="block py-2 text-lg font-medium text-gray-700 hover:text-pink-500">
            📅 Tracker
          </Link>
        </div>
      </div>
    </nav>
  );
}
