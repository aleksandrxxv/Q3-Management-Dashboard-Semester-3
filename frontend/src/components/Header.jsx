import { FaSearch, FaUserCircle, FaCog, FaBell } from "react-icons/fa";

import logo from "../assets/logo.svg";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b-2 border-[#FC7800] bg-[#111827] text-white">
      {/* Left side: logo + app name */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-8"
        />
      </div>

      {/* Right side: search + icons */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search machines"
            className="border rounded-md px-4 py-1 text-black"
          />
          <FaSearch className="absolute right-2 top-2 text-gray-400" />
        </div>
        <FaBell className="cursor-pointer" />
        <FaCog className="cursor-pointer" />
        <FaUserCircle className="cursor-pointer" size={28} />
      </div>
    </header>
  );
}
