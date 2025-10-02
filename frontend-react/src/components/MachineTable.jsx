import { useState, useEffect, useRef, Fragment } from "react";
import { FaChevronRight } from "react-icons/fa";
import MachineGraph from "./MachineGraph";
import MoldPill from "./MoldPill";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function MachineTable() {
  const [machines, setMachines] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [machineData, setMachineData] = useState({});
  const [moldData, setMoldData] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("1h");

  const rowRefs = useRef({});

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        console.log("🌐 Fetching machines from:", `${API_URL}/api/machines`);
        const res = await fetch(`${API_URL}/api/machines`);
        const data = await res.json();
        console.log("✅ Machines fetched:", data);
        setMachines(data);
      } catch (err) {
        console.error("❌ Error fetching machines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  const fetchShots = async (machineName, range) => {
    try {
      const moldRes = await fetch(`${API_URL}/api/molds/${machineName}`);
      const mold = await moldRes.json();
      console.log("🔗 Installed mold for", machineName, "→", mold);

      if (!mold || !mold.mold1_id) {
        console.warn("⚠️ No mold installed for", machineName);
        return [];
      }

      // save mold for pill display
      setMoldData((prev) => ({
        ...prev,
        [machineName]: {
          moldId: mold.mold1_id,
          moldName: mold.mold1_name,
        },
      }));

      const now = new Date();
      let startDate;

      if (range === "1h") {
        startDate = new Date("2000-01-01"); // all data
      } else if (range === "5m") {
        startDate = new Date(now.getTime() - 5 * 60 * 1000);
      } else if (range === "10m") {
        startDate = new Date(now.getTime() - 10 * 60 * 1000);
      } else if (range === "1d") {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (range === "1w") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const start = startDate.toISOString().split("T")[0];
      const end = now.toISOString().split("T")[0];

      const url = `${API_URL}/api/molds/${mold.mold1_id}/history?startDate=${start}&endDate=${end}`;
      console.log("🌐 Fetching shots for", machineName, "range=", range, "→", url);

      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Error fetching history:", err);
        return [];
      }

      const json = await res.json();

      return json.map((entry) => {
        const startTs = new Date(`${entry.start_Date}T${entry.start_Time}`);
        const endTs = new Date(`${entry.end_Date}T${entry.end_Time}`);
        return {
          timestamp: startTs.toISOString(),
          shotTime: (endTs - startTs) / 1000,
        };
      });
    } catch (err) {
      console.error("❌ fetchShots failed:", err);
      return [];
    }
  };

  const toggleRow = async (machine) => {
    const isExpanding = expandedRow !== machine.id;
    setExpandedRow(isExpanding ? machine.id : null);

    if (isExpanding && !machineData[machine.name]) {
      const shots = await fetchShots(machine.name, view);
      setMachineData((prev) => ({ ...prev, [machine.name]: shots }));
    }
  };

  const handleRangeChange = async (range, machine) => {
    setView(range);
    if (expandedRow === machine.id) {
      const shots = await fetchShots(machine.name, range);
      setMachineData((prev) => ({ ...prev, [machine.name]: shots }));
    }
  };

  if (loading) {
    return <div className="p-6">Loading machines...</div>;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Machine</th>
            <th className="px-4 py-3">Board</th>
            <th className="px-4 py-3">Port</th>
            <th className="px-4 py-3">Visible</th>
            <th className="px-4 py-3 text-right">Expand</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {machines.map((machine) => (
            <Fragment key={machine.id}>
              <tr
                ref={(el) => (rowRefs.current[machine.id] = el)}
                className={`cursor-pointer transition-colors ${
                  expandedRow === machine.id
                    ? "bg-yellow-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {machine.name}
                </td>
                <td className="px-4 py-3 text-gray-700">{machine.board}</td>
                <td className="px-4 py-3 text-gray-700">{machine.port}</td>
                <td className="px-4 py-3">
                  {machine.visible ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRow(machine)}
                    className={`text-gray-600 hover:text-gray-800 transition-transform duration-300 ${
                      expandedRow === machine.id ? "rotate-90" : ""
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </td>
              </tr>

              <tr>
                <td colSpan="6" className="p-0">
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      expandedRow === machine.id
                        ? "grid-rows-[1fr] bg-gray-50 p-6"
                        : "grid-rows-[0fr] p-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {expandedRow === machine.id && (
                        <>
                          {/* Installed Mold heading + pill */}
                          {moldData[machine.name] && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Installed Mold
                              </h4>
                              <MoldPill mold={moldData[machine.name]} />
                            </div>
                          )}

                          {/* Range buttons */}
                          <div className="flex justify-end gap-2 mb-4">
                            {["5m", "10m", "1h", "1d", "1w"].map((range) => (
                              <button
                                key={range}
                                onClick={() =>
                                  handleRangeChange(range, machine)
                                }
                                className={`px-3 py-1 border rounded-md text-xs font-medium transition-colors ${
                                  view === range
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                              >
                                {range}
                              </button>
                            ))}
                          </div>

                          {/* Graph */}
                          <MachineGraph
                            machineName={machine.name}
                            data={machineData[machine.name] || []}
                            view={view}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
