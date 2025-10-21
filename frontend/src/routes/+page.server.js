import { supabase } from '$lib/supabaseClient';

const selectedDate = '2020-10-01';

export async function load() {
  // Fetch machine + mold info in parallel
  const [machinesRes, activeMoldsRes, historyRes, bestMachineRes] = await Promise.all([
    supabase.rpc('get_machine_status_on_date', { simulation_date: selectedDate }),
    supabase.rpc('get_molds_on_machine'),
    supabase.rpc('get_mold_machine_history'),
    supabase.rpc('get_best_machine_total_shots')
  ]);

  // Default fallback
  const stats = {
    totalMachines: 0,
    activeMachines: 0,
    inactiveMachines: 0,
    operational: 0,
    standstill: 0,
    totalMolds: 0,
    activeMolds: 0,
    inactiveMolds: 0,
    totalShotRows: 0,
    bestMachine: { name: 'No data', shots: 0 },
    topMold: { name: 'No data', uses: 0 },
  };

  // --- Machines ---
  if (!machinesRes.error) {
    const ports = (machinesRes.data ?? []).map((m) => ({
      ...m,
      active_status: m.active_status?.toLowerCase() ?? 'inactive',
      operational_status: m.operational_status?.toLowerCase() ?? 'standstill',
    }));

    stats.totalMachines = ports.length;
    stats.activeMachines = ports.filter((p) => p.active_status === 'active').length;
    stats.inactiveMachines = stats.totalMachines - stats.activeMachines;
    stats.operational = ports.filter((p) => p.operational_status === 'inproduction').length;
    stats.standstill = ports.filter((p) => p.operational_status === 'standstill').length;

    // Optional: count sample shot rows
    const simulatedNow = new Date('2020-10-30T23:59:59Z').toISOString();
    const startOfMonth = new Date('2020-09-01T00:00:00Z').toISOString();
    const sampleMachines = ports.slice(0, 5);

    const shotPromises = sampleMachines.map(async (m) => {
      if (!m.board || !m.port) return 0;
      const { data, error } = await supabase.rpc('get_shot_time_avg', {
        p_start: startOfMonth,
        p_end: simulatedNow,
        p_interval: 'hour',
        p_board: Number(m.board),
        p_port: Number(m.port),
      });
      if (error) return 0;
      return Array.isArray(data) ? data.length : 0;
    });

    const shotCounts = await Promise.all(shotPromises);
    stats.totalShotRows = shotCounts.reduce((sum, count) => sum + count, 0);
  }

  // --- Molds ---
  const history = !historyRes.error ? historyRes.data ?? [] : [];
  const activeMolds = !activeMoldsRes.error ? activeMoldsRes.data ?? [] : [];

  if (history.length > 0 || activeMolds.length > 0) {
    const uniqueMoldIds = [...new Set(history.map((h) => h.mold_id))];
    stats.totalMolds = uniqueMoldIds.length;
    stats.activeMolds = activeMolds.length;
    stats.inactiveMolds = stats.totalMolds - stats.activeMolds;

    // top mold
    const moldCounts = history.reduce((acc, h) => {
      acc[h.mold_name] = (acc[h.mold_name] || 0) + 1;
      return acc;
    }, {});
    const topMoldName =
      Object.entries(moldCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';
    stats.topMold = {
      name: topMoldName,
      uses: moldCounts[topMoldName] ?? 0,
    };
  }

  // --- Best Machine ---
  if (!bestMachineRes.error && bestMachineRes.data?.length > 0) {
    // use correct column name: "machine" from your SQL
    stats.bestMachine = {
      name: bestMachineRes.data[0].machine ?? 'Unknown',
      shots: bestMachineRes.data[0].total_shots ?? 0,
    };
  }

  return { stats };
}
