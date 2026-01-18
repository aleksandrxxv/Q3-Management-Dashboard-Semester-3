import { supabase } from './client';
import { HourlyEnergyData } from '@/types/supabase'

export async function fetchHourlyEnergy(friendlyName: string, from: Date, to: Date) {

    const { data, error } = await supabase
        .from('mv_hourly_device_monitoring')
        .select('*')
        .eq('friendly_name', friendlyName)
        .gte('hour_start', from.toISOString())
        .lte('hour_start', to.toISOString())
        .order('hour_start', { ascending: true });

    if (error) throw error;
    return data as HourlyEnergyData[];
}