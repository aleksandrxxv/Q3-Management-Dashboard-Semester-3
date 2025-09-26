import { Link } from "react-router-dom";
import {
  FaHome,
  FaChartBar,
  FaShoppingBag,
  FaComments,
  FaCalendarAlt,
} from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#111827] text-white flex flex-col shadow-lg">
      <nav className="flex-1 overflow-y-auto">
        {/* HOME Section */}
        <div className="px-4 py-2 text-xs uppercase text-[#FC7800] font-semibold tracking-wide">
          Home
        </div>

        <Link
          to="/"
          className="flex items-center justify-between px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <div className="flex items-center gap-2">
            <FaHome className="text-[#FC7800]" />
            <span>Modern</span>
          </div>
          <span className="bg-[#FC7800] text-black text-xs px-2 py-0.5 rounded-full">
            New
          </span>
        </Link>

        <Link
          to="/analytical"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaChartBar className="text-[#FC7800]" />
          <span>Analytical</span>
        </Link>

        <Link
          to="/ecommerce"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaShoppingBag className="text-[#FC7800]" />
          <span>eCommerce</span>
        </Link>

        {/* APPS Section */}
        <div className="px-4 py-2 text-xs uppercase text-[#FC7800] font-semibold tracking-wide">
          Apps
        </div>

        <Link
          to="/chat"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaComments className="text-[#FC7800]" />
          <span>Chat</span>
        </Link>

        <Link
          to="/calendar"
          className="flex items-center gap-2 px-4 py-2 rounded-md mx-2 mb-1 hover:bg-[#1f2937] transition"
        >
          <FaCalendarAlt className="text-[#FC7800]" />
          <span>Calendar</span>
        </Link>
      </nav>
    </aside>
  );
}
