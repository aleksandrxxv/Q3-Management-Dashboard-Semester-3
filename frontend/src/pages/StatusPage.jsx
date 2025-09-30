import MachinePage from "./MachinePage";

export default function StatusPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <main className="p-2">
          <h2 className="text-2xl font-bold mb-4">Machine Status Overview</h2>
          <MachinePage />
        </main>
      </div>
    </div>
  );
}
