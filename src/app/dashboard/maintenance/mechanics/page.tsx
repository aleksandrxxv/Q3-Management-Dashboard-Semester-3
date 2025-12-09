export const dynamic = 'force-dynamic';

import { fetchMechanics } from "@/lib/supabase/fetchMechanics";

import Header from "../../header";

import { MechanicTable } from "./table";

export default async function Page() {
  const mechanics = await fetchMechanics();

  return (
    <>
      <Header
        title={"Mechanics"}
        description={"You can add, delete and adjust mechanics here."}
      />
      <div>
        <MechanicTable mechanics={mechanics} />
        
      </div>
    </>
  );
}
