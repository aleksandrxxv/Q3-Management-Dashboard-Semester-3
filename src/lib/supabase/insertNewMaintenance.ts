import { Maintenance } from "@/types/supabase";
import { supabase } from "./client";


export async function insertNewMaintenance(maintenance: Omit<Maintenance, "id" | "status">) {

    

    const {error} = await supabase
        .from('i_machines_maintenance')
        .insert(maintenance)

    if (error) {
        throw new Error(`Error inserting maintenance: ${error.message}`);
    }

    return;
}