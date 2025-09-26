import { Link } from "react-router-dom";
import { FaIndustry, FaCube, FaCogs } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#111827] text-white flex flex-col shadow-lg">
      <nav className="flex-1 overflow-y-auto">
        {/* MAIN Section */}
        <div className="px-4 py-2 text-xs uppercase text-[#FC7800] font-semibold tracking-wide">
          Dashboard
        </div>

        {/* Machines */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaIndustry className="text-[#FC7800]" />
          <span>Machines</span>
        </Link>

        {/* Molds */}
        <Link
          to="/molds"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaCube className="text-[#FC7800]" />
          <span>Molds</span>
        </Link>

        {/* Optional system section */}
        <div className="px-4 py-2 text-xs uppercase text-[#FC7800] font-semibold tracking-wide">
          System
        </div>

        <Link
          to="/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaCogs className="text-[#FC7800]" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
