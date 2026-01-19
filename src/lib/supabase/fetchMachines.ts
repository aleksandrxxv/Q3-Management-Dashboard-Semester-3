import { supabase } from './client';
import { Machine } from '../../types/supabase';

/**
 * Fetch all machines
 */
export const fetchMachines = async (): Promise<Machine[]> => {
  const { data, error } = await supabase
    .from('v_machine_status')
    .select('*')
    .order('status', { ascending: true });

  if (error) {
    throw new Error(`Error fetching machine timelines: ${error.message}`);
  }

  // Ensure proper type conversion (handle bigint -> number conversion)
  return (data || []).map((machine: any) => ({
    ...machine,
    total_shots: typeof machine.total_shots === 'string' 
      ? parseInt(machine.total_shots, 10) 
      : Number(machine.total_shots) || 0,
    avg_shot_time: typeof machine.avg_shot_time === 'string'
      ? parseFloat(machine.avg_shot_time)
      : Number(machine.avg_shot_time) || 0,
    last_update: machine.last_update || null,
  }));
};


// fetch specific machine
export const fetchMachine = async (machine_id: string): Promise<Machine> => {
  const { data, error } = await supabase
    .from('v_machine_status')
    .select('*')
    .eq('machine_id', machine_id)
    .single();

  if (error) {
    throw new Error(`Error fetching machine: ${error.message}`);
  }

  return data;
};