import { FaBell, FaSync, FaChevronRight } from "react-icons/fa";

export default function MachineRow({
  name,
  status,
  output,
  lastChecked,
  isExpanded,
  toggleRow,
}) {
  const statusColors = {
    Operational: "text-green-600 bg-green-100",
    Maintenance: "text-yellow-600 bg-yellow-100",
    Inactive: "text-red-600 bg-red-100",
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
      <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            statusColors[status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700">{output}</td>
      <td className="px-4 py-3 text-gray-500">{lastChecked}</td>
      <td className="px-4 py-3 flex items-center gap-3">
        <button className="text-gray-500 hover:text-gray-700 active:scale-90 transition-transform">
          <FaBell />
        </button>
        <button className="text-gray-500 hover:text-gray-700 active:scale-90 transition-transform">
          <FaSync />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={toggleRow}
          className={`text-gray-600 hover:text-gray-800 transition-transform duration-300 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <FaChevronRight />
        </button>
      </td>
    </tr>
  );
}
