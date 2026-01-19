import { fetchMechanics } from "@/lib/supabase/fetchMechanics";
import Header from "../../header";
import { MechanicTable } from "./table";
import { unstable_cache } from "next/cache";

export default async function Page() {
  const getMechanicsCached = unstable_cache(
      async () => fetchMechanics(),
      ["mechanics"],
      { revalidate: 10 }
    );
  const mechanics = await getMechanicsCached();

  return (
    <>
      <Header
        title={"Mechanics"}
        description={"Here you can add, remove, and edit mechanics."}
      />
      <div>
        <MechanicTable mechanics={mechanics} />
        
      </div>
    </>
  );
}
