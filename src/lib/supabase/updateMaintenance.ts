import {Maintenance} from "@/types/supabase";
import {supabase} from "./client";


export async function updateMaintenance(maintenance: Maintenance) {
    const {error} = await supabase
        .from('i_machines_maintenance')
        .update(maintenance).eq('id', maintenance.id)

    if (error) {
        throw new Error(`Error updating maintenance: ${error.message}`);
    }

    return;
}