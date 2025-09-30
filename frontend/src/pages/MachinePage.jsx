import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MachineTable from "../components/MachineTable";

export default function MachineHealthPage() {
  const { machineId } = useParams();
  const [machines, setMachines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedMachine, setHighlightedMachine] = useState(null);
  const machinesPerPage = 4;
  const machineRefs = useRef({});

  // Fetch machines
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    fetch(`${apiUrl}/api/machines`)
      .then((res) => res.json())
      .then((data) => {
        setMachines(data);
      })
      .catch((err) => console.error("Error fetching machines:", err));
  }, []);

  // Pagination
  const indexOfLast = currentPage * machinesPerPage;
  const indexOfFirst = indexOfLast - machinesPerPage;
  const currentMachines = machines.slice(indexOfFirst, indexOfLast);

  // Jump to machine if machineId is in URL
  useEffect(() => {
    if (machineId && machines.length > 0) {
      const machineIndex = machines.findIndex(
        (m) => m.id.toString() === machineId
      );
      if (machineIndex >= 0) {
        setCurrentPage(Math.floor(machineIndex / machinesPerPage) + 1);
        setTimeout(() => {
          machineRefs.current[machineId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setHighlightedMachine(machineId);
          setTimeout(() => setHighlightedMachine(null), 3000);
        }, 200);
      }
    }
  }, [machineId, machines]);

  return (
    <div className="p-2">

      <MachineTable
        machines={currentMachines}
        machineRefs={machineRefs}
        highlightedMachine={highlightedMachine}
      />

      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">Page {currentPage}</span>
        <button
          disabled={indexOfLast >= machines.length}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
