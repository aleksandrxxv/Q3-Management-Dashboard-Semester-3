import MachineRow from "./MachineRow";

const machineData = [
  {
    name: "Machine 1",
    status: "Operational",
    output: "Active",
    lastChecked: "24/08/2023 08:42 AM",
  },
  {
    name: "Machine 2",
    status: "Maintenance",
    output: "Inactive",
    lastChecked: "24/08/2023 11:23 PM",
  },
  {
    name: "Machine 3",
    status: "Inactive",
    output: "Team A",
    lastChecked: "21/08/2023 07:09 AM",
  },
];

export default function MachineTable() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Machine Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Output</th>
            <th className="px-4 py-3">Last Checked</th>
            <th className="px-4 py-3">Alerts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {machineData.map((machine, index) => (
            <MachineRow key={index} {...machine} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
