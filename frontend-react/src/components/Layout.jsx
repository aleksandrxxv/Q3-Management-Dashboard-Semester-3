import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Header with logo */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar below header */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
