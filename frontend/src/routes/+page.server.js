import { supabase } from '$lib/supabaseClient';

const selectedDate = '2020-10-01';

export async function load() {
  // Fetch machine + mold info in parallel
  const [machinesRes, activeMoldsRes, historyRes] = await Promise.all([
    supabase.rpc('get_machine_status_on_date', { simulation_date: selectedDate }),
    supabase.rpc('get_molds_on_machine'),
    supabase.rpc('get_mold_machine_history'),
  ]);

  // Handle any Supabase errors safely
  if (machinesRes.error || activeMoldsRes.error || historyRes.error) {
    console.error('Supabase errors:', machinesRes.error || activeMoldsRes.error || historyRes.error);
    return {
      stats: {
        totalMachines: 0,
        activeMachines: 0,
        inactiveMachines: 0,
        operational: 0,
        standstill: 0,
        totalMolds: 0,
        activeMolds: 0,
        inactiveMolds: 0,
        totalShotRows: 0,
        bestMachine: { name: 'No data', uptime: 0, cycles: 0 },
        topMold: { name: 'No data', uses: 0 },
      },
    };
  }

  // Normalize machine statuses
  const ports = (machinesRes.data ?? []).map((m) => ({
    ...m,
    active_status: m.active_status?.toLowerCase() ?? 'inactive',
    operational_status: m.operational_status?.toLowerCase() ?? 'standstill',
  }));

  const totalMachines = ports.length;
  const activeMachines = ports.filter((p) => p.active_status === 'active').length;
  const inactiveMachines = totalMachines - activeMachines;
  const operational = ports.filter((p) => p.operational_status === 'inproduction').length;
  const standstill = ports.filter((p) => p.operational_status === 'standstill').length;

  // Count total shot rows (the same as {shots.length} in each chart)
  const simulatedNow = new Date('2020-10-30T23:59:59Z').toISOString();
  const startOfMonth = new Date('2020-09-01T00:00:00Z').toISOString();

  let totalShotRows = 0;

  // Run get_shot_time_avg for up to 5 machines in parallel for performance
  const sampleMachines = ports.slice(0, 5); // limit for speed, can increase

  const shotPromises = sampleMachines.map(async (m) => {
    if (!m.board || !m.port) return 0;

    const { data, error } = await supabase.rpc('get_shot_time_avg', {
      p_start: startOfMonth,
      p_end: simulatedNow,
      p_interval: 'hour',
      p_board: Number(m.board),
      p_port: Number(m.port),
    });

    if (error) {
      console.warn(`Skipping board ${m.board}/${m.port}:`, error.message);
      return 0;
    }
    return Array.isArray(data) ? data.length : 0;
  });

  const shotCounts = await Promise.all(shotPromises);
  totalShotRows = shotCounts.reduce((sum, count) => sum + count, 0);

  // Mold stats
  const activeMolds = activeMoldsRes.data ?? [];
  const history = historyRes.data ?? [];

  const uniqueMoldIds = [...new Set(history.map((h) => h.mold_id))];
  const totalMolds = uniqueMoldIds.length;
  const activeMoldsCount = activeMolds.length;
  const inactiveMolds = totalMolds - activeMoldsCount;

  // Best machine (most linked in history)
  const machineCounts = history.reduce((acc, h) => {
    acc[h.machine] = (acc[h.machine] || 0) + 1;
    return acc;
  }, {});
  const bestMachineName =
    Object.entries(machineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';

  // Most used mold
  const moldCounts = history.reduce((acc, h) => {
    acc[h.mold_name] = (acc[h.mold_name] || 0) + 1;
    return acc;
  }, {});
  const topMoldName =
    Object.entries(moldCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';

  // Return all stats
  return {
    stats: {
      totalMachines,
      activeMachines,
      inactiveMachines,
      operational,
      standstill,
      totalMolds,
      activeMolds: activeMoldsCount,
      inactiveMolds,
      totalShotRows, // Real shot data count (sum of {shots.length})
      bestMachine: {
        name: bestMachineName,
        uptime: 0,
        cycles: machineCounts[bestMachineName] ?? 0,
      },
      topMold: {
        name: topMoldName,
        uses: moldCounts[topMoldName] ?? 0,
      },
    },
  };
}
