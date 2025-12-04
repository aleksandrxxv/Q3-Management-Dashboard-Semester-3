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
        title={"Monteurs"}
        description={"Hier kun je monteurs toevoegen, verwijderen en aanpassen."}
      />
      <div>
        <MechanicTable mechanics={mechanics} />
        
      </div>
    </>
  );
}
