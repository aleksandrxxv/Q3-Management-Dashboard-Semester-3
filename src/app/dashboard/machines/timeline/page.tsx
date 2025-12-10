import { fetchMachines } from "@/lib/supabase/fetchMachines";
import { Machine, MachineTimeline } from "@/types/supabase";
import { unstable_cache } from "next/cache";
import Rows from "./rows";

// extend machine type with timeline
export interface MachineWithData extends Machine {
  data?: MachineTimeline[];
}

export default async function Page() {
  const getMachinesCached = unstable_cache(
    async () => fetchMachines(),
    ["machines"],
    { revalidate: 10 }
  );

  const machines = await getMachinesCached();

  // TEST MACHINE
  const testMachine: Machine = {
    machine_id: 999999,        
    machine_name: "TEST MACHINE",
    board: "SIM",
    port: 1,
    status: "active",
  };

  // Append test machine to the list
  const machinesWithTest = [...machines, testMachine];

  return (
    <div>
      <Rows machines={machinesWithTest} />
    </div>
  );
}
