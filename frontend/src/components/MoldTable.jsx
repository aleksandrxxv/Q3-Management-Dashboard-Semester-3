import { useState, useRef, useEffect } from "react";
import MoldRow from "./MoldRow";
import MoldGraph from "./MoldGraph";
import molds from "../data/dummy.json"; // local JSON file

export default function MoldTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const rowRefs = useRef({}); // keep refs for each mold

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    if (expandedRow && rowRefs.current[expandedRow]) {
      // Smooth scroll to expanded row
      rowRefs.current[expandedRow].scrollIntoView({
        behavior: "smooth",
        block: "center", // keep row in middle of screen
      });
    }
  }, [expandedRow]);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Mold Name</th>
            <th className="px-4 py-3">Total Operations</th>
            <th className="px-4 py-3">Machines Used</th>
            <th className="px-4 py-3 text-right">Expand</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {molds.map((mold) => (
            <>
              <MoldRow
                key={mold.moldId}
                moldName={mold.moldName}
                totalOperations={mold.totalOperations}
                machinesUsed={mold.machinesUsed}
                isExpanded={expandedRow === mold.moldId}
                toggleRow={() => toggleRow(mold.moldId)}
              />
              <tr
                ref={(el) => (rowRefs.current[mold.moldId] = el)} // attach ref here
              >
                <td colSpan="4" className="p-0">
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      expandedRow === mold.moldId
                        ? "grid-rows-[1fr] p-6 bg-gray-50"
                        : "grid-rows-[0fr] p-0 bg-transparent"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {expandedRow === mold.moldId && (
                        <MoldGraph
                          moldName={mold.moldName}
                          data={mold.opsPerWeek}
                        />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
