import { useState, useRef, useEffect } from "react";
import { FaChevronRight } from "react-icons/fa";
import MoldGraph from "./MoldGraph";

export default function MoldTable({ molds, moldRefs, highlightedMold = null }) {
  const [expandedRow, setExpandedRow] = useState(null);

  // use the page's refs for scrolling; fallback to local refs if not provided
  const localRefs = useRef({});
  const rowRefs = moldRefs ?? localRefs;

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Optionally auto-expand the highlighted row (nice UX)
  useEffect(() => {
    if (highlightedMold) {
      setExpandedRow(Number(highlightedMold));
    }
  }, [highlightedMold]);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Mold #</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Machine</th>
            {/* <th className="px-4 py-3">End Date</th> */}
            <th className="px-4 py-3">Total Ops</th>
            <th className="px-4 py-3 text-right">Expand</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {molds.map((mold) => (
            <Fragment key={mold.mold1_id}>
              <tr
                ref={(el) => (rowRefs.current[mold.mold1_id] = el)}
                className={`cursor-pointer transition-colors ${
                  String(highlightedMold) === String(mold.mold1_id)
                    ? "bg-yellow-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {mold.mold1_name}
                </td>
                <td className="px-4 py-3 text-gray-700">{mold.mold1_desc}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{mold.name}</td>
                {/* <td className="px-4 py-3 text-gray-500">{mold.end_date}</td> */}
                <td className="px-4 py-3 text-gray-700">
                  {mold.totalOperations ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRow(mold.mold1_id)}
                    className={`text-gray-600 hover:text-gray-800 transition-transform duration-300 ${
                      expandedRow === mold.mold1_id ? "rotate-90" : ""
                    }`}
                    aria-label={`Expand ${mold.mold1_name}`}
                  >
                    <FaChevronRight />
                  </button>
                </td>
              </tr>

              {expandedRow === mold.mold1_id && (
                <tr>
                  <td colSpan="6" className="p-0">
                    <div className="bg-gray-50 p-6">
                      <MoldGraph moldId={mold.mold1_id} moldName={mold.mold1_name} />
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Add this at the top of the file if you use <Fragment>
import { Fragment } from "react";
