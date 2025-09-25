import { FaSearch, FaUserCircle, FaCog, FaBell } from "react-icons/fa";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b">
      <h1 className="text-xl font-bold">Machine Dashboard</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search machines"
            className="border rounded-md px-4 py-1"
          />
          <FaSearch className="absolute right-2 top-2 text-gray-400" />
        </div>
        <FaBell className="text-gray-600 cursor-pointer" />
        <FaCog className="text-gray-600 cursor-pointer" />
        <FaUserCircle className="text-gray-600 cursor-pointer" size={28} />
      </div>
    </header>
  );
}
