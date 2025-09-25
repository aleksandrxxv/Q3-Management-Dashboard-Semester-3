import { FaHome, FaCogs, FaChartBar, FaBell, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black text-white h-screen flex flex-col justify-between">
      <div>
        <nav className="mt-6 space-y-2">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center">
            <FaHome className="mr-2" /> Overview
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center">
            <FaCogs className="mr-2" /> Machines
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center">
            <FaChartBar className="mr-2" /> Status
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center">
            <FaBell className="mr-2" /> Alerts
          </button>
        </nav>
      </div>

      <div className="mb-6">
        <button className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center">
          <FaSignOutAlt className="mr-2" /> Log out
        </button>
      </div>
    </aside>
  );
}
