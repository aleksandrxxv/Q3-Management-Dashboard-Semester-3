import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import molds from "../data/dummy.json";
import MoldTable from "../components/MoldTable";

export default function MoldHealthPage() {
  const { moldId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const moldsPerPage = 20;
  const moldRefs = useRef({});

  // Pagination
  const indexOfLast = currentPage * moldsPerPage;
  const indexOfFirst = indexOfLast - moldsPerPage;
  const currentMolds = molds.slice(indexOfFirst, indexOfLast);

  // Jump to mold if moldId in URL
  useEffect(() => {
    if (moldId) {
      const moldIndex = molds.findIndex((m) => m.moldId.toString() === moldId);
      if (moldIndex >= 0) {
        setCurrentPage(Math.floor(moldIndex / moldsPerPage) + 1);
        setTimeout(() => {
          moldRefs.current[moldId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 200);
      }
    }
  }, [moldId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mold Health</h1>

      <MoldTable molds={currentMolds} moldRefs={moldRefs} />

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
          disabled={indexOfLast >= molds.length}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
