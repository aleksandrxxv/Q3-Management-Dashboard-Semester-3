import { supabaseEnergy } from './client';
import {HourlyEnergySplit} from '@/types/supabase'

export async function fetchEnergySplit(friendlyName: string, from: Date, to: Date) {

    const { data, error } = await supabaseEnergy
        .from('mv_hourly_energy_split')
        .select('*')
        .eq('friendly_name', friendlyName)
        .gte('hour_start', from.toISOString())
        .lte('hour_start', to.toISOString())
        .order('hour_start', { ascending: true });

    if (error) throw error;
    return data as HourlyEnergySplit[];
}