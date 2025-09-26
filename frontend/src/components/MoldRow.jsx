import { FaChevronRight } from "react-icons/fa";

export default function MoldRow({
  moldName,
  totalOperations,
  machinesUsed,
  isExpanded,
  toggleRow,
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
      <td className="px-4 py-3 font-medium text-gray-800">{moldName}</td>
      <td className="px-4 py-3 text-gray-700">{totalOperations}</td>
      <td className="px-4 py-3 text-gray-500">
        {machinesUsed.length > 0 ? machinesUsed.join(", ") : "—"}
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
