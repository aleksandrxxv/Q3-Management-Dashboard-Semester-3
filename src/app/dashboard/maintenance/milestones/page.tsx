import { fetchMolds } from "@/lib/supabase/fetchMolds";
import Header from "../../header";
import { MilestoneTable } from "./table";
import { fetchMilestones } from "@/lib/supabase/milestones";
import { unstable_cache } from "next/cache";

// Get all molds

export default async function Page() {
    const getMoldsCached = unstable_cache(
        async () => fetchMolds(),
        ["molds"],
        { revalidate: 10 }
      );
    const molds = await getMoldsCached();

    const getMilestonesCached = unstable_cache(
    async () => fetchMilestones(),
    ["milestones"],
    { revalidate: 10 }
  );
    const milestones = await getMilestonesCached();

    
    return (
        <div>
           <Header
              title={"Preventive maintenance planning"}
              description={"All preventive maintenance schedules for molds"}
            />


            {/* All molds and its milestones, and a way to add a new one */}
            <div className="flex flex-col">
                <MilestoneTable
                    milestones={milestones}
                    molds={molds}
                    />
            </div>
        </div>
    )
}