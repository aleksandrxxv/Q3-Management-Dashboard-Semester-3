// src/app/dashboard/machines/[whatever]/page.tsx
// (path adjusted to your file location)

import { unstable_cache } from "next/cache";

import Rows from "./rows";

import { getMachines } from "@/lib/data/getMachines";
import { DATA_MODE } from "@/lib/data/dataMode";

import { Machine, MachineTimeline } from "@/types/supabase";

// extend machine type with timeline
export interface MachineWithData extends Machine {
  data?: MachineTimeline[];
}

export default async function Page() {
  const getMachinesCached = unstable_cache(
    () => getMachines(),
    ["machines", DATA_MODE],
    { revalidate: 10 }
  );

  const machines = await getMachinesCached();

  return (
    <div>
      <Rows machines={machines} />
    </div>
  );
}
