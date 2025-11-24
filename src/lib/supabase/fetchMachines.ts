// src/lib/supabase/fetchMachines.ts

import { supabase } from './client';
import { Machine } from '../../types/supabase';

/**
 * Fetch all machines
 */
export const fetchMachines = async (): Promise<Machine[]> => {
    const { data, error } = await supabase
        .from('v_machine_status')
        .select('*')
        .order('status', { ascending: false });

    if (error) {
        console.error('fetchMachines error', JSON.stringify(error, null, 2));
        // Don't crash the whole page, just return empty array
        return [];
    }

    return data || [];
};

/**
 * Fetch a specific machine by id
 */
export const fetchMachine = async (machine_id: string): Promise<Machine> => {
    const { data, error } = await supabase
        .from('v_machine_status')
        .select('*')
        .eq('machine_id', machine_id)
        .single();

    if (error) {
        console.error('fetchMachine error', JSON.stringify(error, null, 2));
        throw new Error(`Error fetching machine: ${error.message}`);
    }

    return data as Machine;
};
