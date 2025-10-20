import { FaSearch, FaUserCircle, FaCog, FaBell } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.svg";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Check if we are on /molds or /molds/:id
  const isMoldsPage = location.pathname.startsWith("/molds");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If already on molds page → just update URL with moldId param
    if (isMoldsPage) {
      navigate(`/molds/${query}`);
    } else {
      // Otherwise redirect to molds page with moldId param
      navigate(`/molds/${query}`);
    }
    setQuery("");
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b-2 border-[#FC7800] bg-[#111827] text-white">
      {/* Left side: logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-8" />
      </div>

      {/* Right side: search + icons */}
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={isMoldsPage ? "Search molds…" : "Search machines…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-md px-4 py-1 text-black"
          />
          <button type="submit">
            <FaSearch className="absolute right-2 top-2 text-gray-400" />
          </button>
        </form>

        <FaBell className="cursor-pointer" />
        <FaCog className="cursor-pointer" />
        <FaUserCircle className="cursor-pointer" size={28} />
      </div>
    </header>
  );
}
