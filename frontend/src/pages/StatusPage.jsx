import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MachineTable from "../components/MachineTable";

export default function StatusPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          <h2 className="text-lg font-semibold">Machine Status Overview</h2>
          <MachineTable />
        </main>
      </div>
    </div>
  );
}
