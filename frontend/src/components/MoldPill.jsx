import { Link } from "react-router-dom";

export default function MoldPill({ mold }) {
  return (
    <Link
      to={`/molds/${mold.moldId}`}
      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300 shadow-sm hover:bg-blue-200 transition"
    >
      {mold.moldName}
    </Link>
  );
}
