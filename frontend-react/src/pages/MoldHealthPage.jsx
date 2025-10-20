import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MoldTable from "../components/MoldTable";

export default function MoldHealthPage() {
  const { moldId } = useParams();
  const [molds, setMolds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedMold, setHighlightedMold] = useState(null);
  const moldsPerPage = 4;
  const moldRefs = useRef({});

  // Fetch molds + total operations
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

    Promise.all([
      fetch(`${apiUrl}/api/molds/installed/all`).then((res) => res.json()),
      fetch(
        `${apiUrl}/api/molds/operations/total?startDate=2019-01-01&endDate=2024-12-31`
      ).then((res) => res.json()),
    ])
      .then(([installed, opsCounts]) => {
        const moldsWithOps = installed.map((m) => {
          const ops = opsCounts.find((o) => o.id === m.mold1_id);
          return { ...m, totalOperations: ops ? ops.operation : 0 };
        });
        setMolds(moldsWithOps);
      })
      .catch((err) => console.error("Error fetching molds:", err));
  }, []);

  // Pagination
  const indexOfLast = currentPage * moldsPerPage;
  const indexOfFirst = indexOfLast - moldsPerPage;
  const currentMolds = molds.slice(indexOfFirst, indexOfLast);

  // Jump to mold if moldId is in URL
  useEffect(() => {
    if (moldId && molds.length > 0) {
      const moldIndex = molds.findIndex((m) => m.mold1_id.toString() === moldId);
      if (moldIndex >= 0) {
        setCurrentPage(Math.floor(moldIndex / moldsPerPage) + 1);
        setTimeout(() => {
          moldRefs.current[moldId]?.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedMold(moldId);
          setTimeout(() => setHighlightedMold(null), 3000); 
        }, 200);
      }
    }
  }, [moldId, molds]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Mold Health Overview</h1>

      <MoldTable
        molds={currentMolds}
        moldRefs={moldRefs}
        highlightedMold={highlightedMold}
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
