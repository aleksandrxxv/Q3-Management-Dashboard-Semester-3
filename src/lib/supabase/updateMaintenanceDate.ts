import {supabase} from "@/lib/supabase/client";

export async function updateMaintenanceDate(id: number, planned_date: Date) {
    const {error} = await supabase
        .from('i_machines_maintenance')
        .update({id: id, planned_date: planned_date}).eq('id', id)

    if (error) {
        throw new Error(`Error updating maintenance date: ${error.message}`);
    }

    return;
}